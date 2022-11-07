import { privateProcedure, router } from "../trpc";
import { z } from "zod";

export const preferenceRouter = router({
  // Get all Preferences belonging to the current user
  byCurrentUser: privateProcedure.query(async ({ ctx }) => {
    const current = await ctx.prisma.preference.findMany({
      where: {
        userId: ctx.user.id,
      },
    });

    if (current) {
      return current;
    }

    // Create default
    return await ctx.prisma.preference.create({
      data: {
        userId: ctx.user.id,
      },
    });
  }),

  // Update Preferences for the current user
  update: privateProcedure
    .input(
      z.object({
        formatLanguage: z.enum(["EN", "DE", "IT", "FR", "ES"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.preference.upsert({
        where: {
          userId: ctx.user.id,
        },
        update: {
          formatLanguage: input.formatLanguage,
        },
        create: {
          userId: ctx.user.id,
          formatLanguage: input.formatLanguage,
        },
      });
    }),
});
