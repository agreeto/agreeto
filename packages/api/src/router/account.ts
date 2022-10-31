import { router, publicProcedure } from "../trpc";
import { z } from "zod";

export const accountRouter = router({
  all: publicProcedure
    .input(z.object({ userId: z.string().cuid() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.account.findMany({ where: input });
    }),
});
