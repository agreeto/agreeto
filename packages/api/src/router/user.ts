import { router, publicProcedure } from "../trpc";

export const userRouter = router({
  current: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findUniqueOrThrow({ where: { id: ctx.user?.id } });
  }),
});
