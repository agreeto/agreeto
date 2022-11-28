import { router, privateProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { EventColorUserRadix } from "@agreeto/db";

export const accountRouter = router({
  // Get the accounts for the current user
  me: privateProcedure.query(async ({ ctx }) => {
    return ctx.prisma.account.findMany({
      include: { userPrimary: true },
      where: { userId: ctx.user.id },
      orderBy: [{ userPrimary: { accountPrimaryId: "asc" } }, { email: "asc" }],
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
      });
    }),

  primary: privateProcedure.query(async ({ ctx }) => {
    const dbUser = await ctx.prisma.user.findUnique({
      select: { accountPrimary: true },
      where: { id: ctx.user.id },
    });
    return dbUser?.accountPrimary;
  }),

  updateColor: privateProcedure
    .input(
      z.object({
        id: z.string(),
        eventColor: z.nativeEnum(EventColorUserRadix),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const account = await ctx.prisma.account.update({
        where: { id: input.id },
        data: { eventColor: input.eventColor },
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
