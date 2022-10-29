import { t } from "../trpc";
import { z } from "zod";

export const accountRouter = t.router({
  all: t.procedure
    .input(z.object({ userId: z.string().cuid() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.account.findMany({ where: input });
    }),
});
