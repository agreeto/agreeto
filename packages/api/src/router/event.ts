import { router, privateProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { GoogleCalendarService } from "../services/google.calendar";
import type { Account } from "@agreeto/db";
import { EventResponseStatus } from "@agreeto/db";
import { DirectoryUserEventSchema } from "../services/service-helpers";
import { getCalendarService } from "../services/service-helpers";

export const eventRouter = router({
  // Get Accounts and AgreeTo Events
  all: privateProcedure
    .input(z.object({ startDate: z.date(), endDate: z.date() }))
    .query(async ({ ctx, input }) => {
      // Get accounts and events from the current user
      const [accounts, userEvents] = await Promise.all([
        ctx.prisma.account.findMany({
          where: { userId: ctx.user.id },
        }),
        ctx.prisma.event.findMany({
          where: {
            userId: ctx.user.id,
            deletedAt: null,
            startDate: {
              gte: input.startDate,
            },
            endDate: {
              lte: input.endDate,
            },
          },
          include: {
            account: true,
            attendees: true,
          },
        }),
      ]);

      // Get calendar Events

      const calendarEvents = await Promise.all(
        accounts.map(async (account) => {
          const service = getCalendarService(account);
          const { events } = await service.getEvents(input);
          return events.map((e) => ({
            ...e,
            account,
          }));
        }),
      );

      // Merge events
      const allEvents = [...userEvents, ...calendarEvents.flat()];

      // Deduplicate allEvents based on event.title, event.startDate and event.endDate
      const dedupedEvents = allEvents.reduce((acc, event) => {
        const existingEvent = acc.find(
          (e) =>
            e.title === event.title &&
            e.startDate?.getTime() === event.startDate?.getTime() &&
            e.endDate?.getTime() === event.endDate?.getTime(),
        );
        if (existingEvent) {
          // If the event already exists, merge the attendees
          existingEvent.attendees = [
            ...(existingEvent.attendees || []),
            ...(event.attendees || []),
          ];
        } else {
          // If the event doesn't exist, add it to the accumulator
          acc.push(event);
        }
        return acc;
      }, [] as typeof allEvents[number][]);

      return dedupedEvents;
    }),

  // Confirm an Event by Id
  confirm: privateProcedure
    .input(
      z.object({
        id: z.string(),
        addConference: z.boolean(),
        title: z.string(),
        attendees: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            surname: z.string(),
            email: z.string(),
            provider: z.string(),
            responseStatus: z.nativeEnum(EventResponseStatus),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get event and confirm it belongs to the current user
      const event = await ctx.prisma.event.findUnique({
        where: {
          id: input.id,
        },
        include: {
          eventGroup: {
            include: {
              account: true,
            },
          },
        },
      });

      if (!event) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Event with id ${input.id} not found`,
        });
      }

      if (event.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: `Event with id ${input.id} does not belong to user ${ctx.user.id}`,
        });
      }

      // Disconnect all attendees so that we can add the new/updated ones
      await ctx.prisma.event.update({
        where: { id: event.id },
        data: {
          attendees: {
            set: [],
          },
        },
      });

      const [updatedEvent, _, eventGroup] = await Promise.all([
        // Update event
        ctx.prisma.event.update({
          where: { id: event.id },
          data: {
            isSelected: true,
            title: input.title,
            hasConference: input.addConference,
            attendees: {
              connectOrCreate: input.attendees.map((a) => ({
                where: {
                  id: a.id,
                },
                create: {
                  ...a,
                },
              })),
            },
          },
        }),
        // Delete all other events in the group
        ctx.prisma.event.updateMany({
          where: {
            eventGroupId: event.eventGroupId,
            id: {
              not: event.id,
            },
          },
          data: {
            deletedAt: new Date(),
            title: input.title,
          },
        }),
        // Update event group
        ctx.prisma.eventGroup.update({
          where: { id: event.eventGroupId },
          data: {
            isSelectionDone: true,
            title: input.title,
          },
        }),
      ]);

      // Get deleted rows
      const deletedEvents = await ctx.prisma.event.findMany({
        where: {
          eventGroupId: event.eventGroupId,
          id: {
            not: event.id,
          },
        },
      });

      if (eventGroup.createBlocker) {
        // Delete events from calendar
        const deletePromise = (async () => {
          const { account } = event.eventGroup;
          await Promise.all(
            deletedEvents.map((del) => {
              const service = getCalendarService(account);
              return service
                .deleteEvent(del.providerEventId as string)
                .catch((err) =>
                  console.error(
                    `Failed to delete the event from the calendar service for the event: ${del.providerEventId}`,
                    err,
                  ),
                );
            }),
          );
        })();

        // Update event in calendar
        const updatePromise = (async () => {
          const accounts = await ctx.prisma.account.findMany({
            where: { userId: ctx.user.id },
            include: { userPrimary: true },
          });
          const primaryAccount = accounts.find((a) => Boolean(a.userPrimary));
          if (!primaryAccount) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "User has no primary account",
            });
          }

          // Create a unique array of attendee and user's other emails
          const attendeeEmails = [
            ...new Set([
              ...input.attendees.map((a) => a.email),
              ...accounts.map((a) => a.email).filter((e): e is string => !!e),
            ]),
          ];

          const service = getCalendarService(primaryAccount);
          await service.updateEvent(event.providerEventId as string, {
            hasConference: input.addConference,
            title: input.title,
            attendeeEmails,
          });
        })();

        // Await both promises
        await Promise.all([deletePromise, updatePromise]);
      }

      return updatedEvent;
    }),

  // Get directory users with belonging events
  directoryUsers: privateProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
        directoryUsers: z
          .object({
            id: z.string(),
            name: z.string(),
            surname: z.string(),
            email: z.string(),
            // TODO (richard): restrict this to be "google" only as we don't support other providers yet as per burak @link https://agreeto.slack.com/archives/D03N3PU7B9U/p1669627377503479
            provider: z.string(),
            // events: z.array(EventValidator.partial()).optional(),
          })
          // TODO (richard): add a length limitation: maximum 5 users (we don't support more colors rn)
          .array(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // get the user's connected accounts
      const userAccounts = await ctx.prisma.account.findMany({
        where: { userId: ctx.user.id },
      });
      const result: Array<{
        user: typeof input.directoryUsers[number] & {
          eventColor: typeof availableColors;
        };
        events: Array<z.infer<typeof DirectoryUserEventSchema>>;
      }> = [];
      const availableColors = [
        "green",
        "red",
        "blue",
        "yellow",
        "orange",
      ] as const;
      // need the index to access the color later
      for (const [
        directoryUsersIndex,
        directoryUser,
      ] of input.directoryUsers.entries()) {
        const userAccountOnSameDomain = userAccounts.find((userAccount) => {
          // if the userAccount doesn't have an email set, it can't query the GCal API for events
          if (!userAccount.email) return false;
          // if the userAccount's email is not on the same domain as the directoryUser's email, the userAccount won't be allowed to query the GCal API for events of the directoryUser.
          if (!isDomainEqual(userAccount.email, directoryUser.email))
            return false;
          return true;
        });
        if (!userAccountOnSameDomain) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: `User ${ctx.user.id} is not authorized to see ${directoryUser.email}'s events`,
          });
        }

        // now, we have a directoryUser and a userAccount on the same domain to fetch the events with, so let's fetch.
        const google = new GoogleCalendarService(
          userAccountOnSameDomain.access_token,
          userAccountOnSameDomain.refresh_token,
        );

        const directoryUserEvents = await google.getEvents({
          startDate: input.startDate,
          endDate: input.endDate,
          email: directoryUser.email,
        });
        result.push({
          user: {
            ...directoryUser,
            // can be undefined, shouldn't throw though because we limit the directoryUser input to max 5
            // @ts-expect-error: not sure why this is complains about it possibly bein g a string? TODO: add zod validatoin
            eventColor:
              availableColors[directoryUsersIndex] || availableColors[0],
          },
          events: z
            .array(DirectoryUserEventSchema)
            .parse(directoryUserEvents.events),
        });
      }
      return result;
    }),
});

/**
 * Checks if the two emails are on the same domain
 note (richard): didn't feel like implementing something via the browser's email validation regex, may need to revisit this for more robustness (subdomains etc)
@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/email#basic_validation
*/
const isDomainEqual = (
  email1: NonNullable<Account["email"]>,
  email2: NonNullable<Account["email"]>,
) => email1.split("@")[1] === email2.split("@")[1];
