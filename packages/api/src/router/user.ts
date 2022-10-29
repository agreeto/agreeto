import { t } from "../trpc";

export const userRouter = t.router({
  current: t.procedure.query(({ ctx }) => {
    return ctx.prisma.user.findUniqueOrThrow({ where: { id: ctx.user?.id } });
  }),
});
