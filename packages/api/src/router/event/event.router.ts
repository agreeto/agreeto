import { router, privateProcedure } from "../../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

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
            responseStatus: z.enum([
              "ACCEPTED",
              "DECLINED",
              "TENTATIVE",
              "NEEDS_ACTION",
            ]),
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
      const { id, eventGroupId } = event;
      const result = await Promise.all([
        ctx.prisma.event.update({
          where: { id },
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
            eventGroupId,
            id: {
              not: id,
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
      const eventGroup = await ctx.prisma.eventGroup.update({
        where: { id: eventGroupId },
        data: {
          isSelectionDone: true,
          title: input.title,
        },
      });

      if (eventGroup.createBlocker) {
        await Promise.all([
          // Delete from actual calendars if created
          // Update
        ]);
      }

      // Get deleted rows
      const deleted = await ctx.prisma.event.findMany({
        where: {
          eventGroupId,
          id: {
            not: id,
          },
        },
      });

      return { selected: result[0], deleted };
    }),
});
