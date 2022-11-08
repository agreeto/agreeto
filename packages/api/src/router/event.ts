import { router, privateProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { GoogleCalendarService } from "../services/google.calendar";
import { EventValidator } from "../validators/event";
import { EventResponseStatus, type Event } from "@agreeto/db";

export const eventRouter = router({
  // Get all Events belonging to the current user
  all: privateProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.account.findMany({
      where: {
        userId: ctx.user.id,
      },
    });
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

      // Confirm the event
      const eventPromise = Promise.all([
        ctx.prisma.event.update({
          where: { id: event.id },
          data: {
            isSelected: true,
            title: input.title,
            hasConference: input.addConference,
            attendees: {
              createMany: {
                data: input.attendees,
              },
            },
          },
        }),
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
            // FIXME: How do I update this???
            // attendees:
          },
        }),
      ]);

      // Update the event group
      const eventGroupPromise = ctx.prisma.eventGroup.update({
        where: { id: event.eventGroupId },
        data: {
          isSelectionDone: true,
          title: input.title,
        },
      });

      const [{ selected, deleted }, eventGroup] = await Promise.all([
        eventPromise,
        eventGroupPromise,
      ]);

      if (eventGroup.createBlocker) {
        await Promise.all([
          // Delete from actual calendars if created
          // Update
        ]);
      }

      // Get deleted rows
      const deleted = await ctx.prisma.event.findMany({
        where: {
          eventGroupId: event.eventGroupId,
          id: {
            not: event.id,
          },
        },
      });

      return { selected: result[0], deleted };
    }),

  // Get directory users with belonging events
  directoryUsers: privateProcedure
    .input(
      z.object({
        startDate: z.string(),
        endDate: z.string(),
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
