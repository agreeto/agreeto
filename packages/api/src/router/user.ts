import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, publicProcedure, privateProcedure } from "../trpc";

export const userRouter = router({
  // Get the current user
  me: privateProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: {
        id: ctx.user.id,
      },
    });
    return user;
  }),

  byEmail: publicProcedure
    .input(z.object({ email: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          email: input.email,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `User with email ${input.email} not found`,
        });
      }

      return user;
    }),

  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `User with id ${input.id} not found`,
        });
      }

      return user;
    }),

  // TODO: Do we need this, or does NextAuth handle this???
  // updateActiveAccounts: privateProcedure
  //   .input(z.object({ accounts: z.string().array() }))
  //   .mutation(async ({ ctx, input }) => {
  //     try {
  //       await ctx.prisma.user.update({
  //         where: { id: ctx.user.id },
  //         data: {
  //           activeAccounts: {
  //             push: input.accounts,
  //           },
  //         },
  //       });
  //       return { success: true };
  //     } catch {
  //       return { success: false };
  //     }
  //   }),
});
