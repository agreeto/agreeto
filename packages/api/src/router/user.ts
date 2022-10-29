import { t } from "../trpc";

export const userRouter = t.router({
  current: t.procedure.query(({ ctx }) => {
    // @ts-expect-error: FIXME: user does not exist on context type
    return ctx.prisma.user.findUniqueOrThrow({ where: { id: ctx.user?.id } });
  }),
});
