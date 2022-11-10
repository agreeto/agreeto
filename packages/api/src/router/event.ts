import { router, privateProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { GoogleCalendarService } from "../services/google.calendar";
import { EventValidator } from "../validators/event";
import { EventResponseStatus, type Event } from "@agreeto/db";
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
          include: { color: true },
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
            account: {
              include: {
                color: true,
              },
            },
            attendees: true,
          },
        }),
      ]);

      // Get calendar Events
      const calendarEvents = await Promise.all(
        accounts
          // FIXME: REMOVE GOOGLE FILTER
          .filter((a) => a.provider === "google")
          .map(async (account) => {
            const { service } = getCalendarService(account);
            const { events } = await service.getEvents(input);
            console.log("events", events);
            return events.map((e) => ({ ...e, account }));
          })
      );

      // Merge events
      const allEvents = [...userEvents, ...calendarEvents.flat()];

      // Remove duplicate events
      const addedEvents = new Map<string | undefined, boolean>();
      const newEvents = allEvents.filter((event) => {
        const { id, startDate, endDate, title } = event;
        // TODO: Find a better way for composite key
        // This composite key is used to avoid duplicate events which have the same name and date, but a different id
        // Note: Having different ids occur when a user with multiple accounts creates an event. The reason for this is that
        // we cannot update non-primary calender ids only by having them attendees
        const compositeKey = `${title},${startDate},${endDate}`;
        // If an event with the same is added before, just skip it to avoid duplicates
        if (addedEvents.has(compositeKey) || addedEvents.has(id)) {
          return false;
        }
        addedEvents.set(compositeKey, true);
        addedEvents.set(id, true);
        return true;
      });
      return newEvents;
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
          })
        ),
        // .optional(),
      })
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

      const [updatedEvent, _, eventGroup] = await Promise.all([
        // Update event
        ctx.prisma.event.update({
          where: { id: event.id },
          data: {
            isSelected: true,
            title: input.title,
            hasConference: input.addConference,
            // attendees: input.attendees,
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
            // attendees: input.attendees,
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
              const { service, eventId } = getCalendarService(account, del);
              return service
                .deleteEvent(eventId as string)
                .catch((err) =>
                  console.error(
                    `Failed to delete the event from the calendar service for the event: ${eventId}`,
                    err
                  )
                );
            })
          );
        })();

        // Update event in calendar
        const updatePromise = (async () => {
          const accounts = await ctx.prisma.account.findMany({
            where: { userId: ctx.user.id },
            include: { color: true },
          });
          const primaryAccount = accounts.find((a) => a.isPrimary);
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
              ...accounts
                .map((a) => a.email)
                .filter((e): e is string => Boolean(e)),
            ]),
          ];

          const { service, eventId } = getCalendarService(
            primaryAccount,
            event
          );
          await service.updateEvent(eventId as string, {
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
        users: z
          .object({
            id: z.string(),
            name: z.string(),
            surname: z.string(),
            email: z.string(),
            provider: z.string(),
            events: z.array(EventValidator.partial()).optional(),
          })
          .array(),
      })
    )
    .query(async ({ ctx, input }) => {
      const accounts = await ctx.prisma.account.findMany({
        where: { userId: ctx.user.id },
        include: { color: true },
      });
      const googleAccounts = accounts.filter(
        (account) => account.provider === "google"
      );

      const result = [...input.users].map((u) => ({
        ...u,
        events: [] as Partial<Event>[],
      }));
      const promises: Promise<void>[] = [];

      input.users
        .filter((user) => user.provider === "google")
        .forEach((user) => {
          googleAccounts.forEach((account) => {
            const google = new GoogleCalendarService(
              account.access_token,
              account.refresh_token
            );

            promises.push(
              google
                .getEvents({
                  startDate: input.startDate,
                  endDate: input.endDate,
                  email: user.email,
                })
                .then(({ events }) => {
                  const foundUser = result.find((r) => r.id === user.id);

                  if (foundUser) {
                    foundUser.events = events.map((e) => ({
                      ...e,
                      account,
                    }));
                  }
                })
                .catch((e) => console.error("Could not fetch user events", e))
            );
          });
        });

      await Promise.all(promises);

      return result;
    }),
});
