import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, publicProcedure, privateProcedure } from "../trpc";

export const userRouter = router({
  // testing route
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.user.findUnique({
        where: {
          id: input.id,
        },
      });
    }),
  current: publicProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.user?.id },
    });
    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `User with Id "${ctx.user?.id}" not found`,
      });
    }
    return user;
  }),
  myAccounts: privateProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findUnique({
      where: { id: ctx.user.id },
      include: { accounts: true },
    });
  }),
});
