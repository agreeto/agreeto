import { TRPCError } from "@trpc/server";
import { router, publicProcedure, privateProcedure } from "../trpc";

export const userRouter = router({
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
    return ctx.prisma.user.findMany({
      where: { id: ctx.user.id },
      include: { accounts: true },
    });
  }),
});
