import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const sessionRouter = router({
  get: publicProcedure.query(({ ctx }) => {
    return ctx.session;
  }),
  validate: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const session = await ctx.prisma.session.findUnique({
        where: { sessionToken: input.token },
      });

      if (session && session.expires >= new Date()) {
        // gracefully return
        return null;
      }

      throw new TRPCError({
        code: "UNAUTHORIZED",
      });
    }),
});
