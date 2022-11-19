import { router, privateProcedure, publicProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const accountRouter = router({
  // Get the accounts for the current user
  me: privateProcedure.query(async ({ ctx }) => {
    return ctx.prisma.account.findMany({
      where: { userId: ctx.user.id },
      include: { color: true },
    });
  }),

  primary: privateProcedure.query(async ({ ctx }) => {
    return ctx.prisma.account.findFirst({
      where: { userId: ctx.user.id, isPrimary: true },
      include: { color: true },
    });
  }),

  colors: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.accountColor.findMany({
      orderBy: { order: "asc" },
    });
  }),

  // Get related accounts for the current user
  related: privateProcedure
    .input(
      z.object({
        id: z.string().optional(),
        email: z.string().email().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.account.findMany({
        where: {
          id: { not: input.id },
          userId: ctx.user.id,
          email: { not: input.email },
        },
        include: { color: true },
      });
    }),

  changePrimary: privateProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const account = await ctx.prisma.account.update({
        where: { id: input.id },
        data: { isPrimary: true },
      });

      // Update the primary account
      await ctx.prisma.account.updateMany({
        where: { userId: ctx.user.id, id: { not: input.id } },
        data: { isPrimary: false },
      });

      return account;
    }),

  delete: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userAccounts = await ctx.prisma.account.findMany({
        where: { userId: ctx.user.id },
      });
      if (userAccounts.length < 2) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Unable to remove account with id ${input.id} as it's the only account for the user`,
        });
      }
      return ctx.prisma.account.delete({
        where: { id: input.id },
      });
    }),

  // TODO:
  // downgrade: privateProcedure.input(z.object({
  //   id: z.string(),
  // })).query(async ({ ctx, input }) => {

  // }),
});
