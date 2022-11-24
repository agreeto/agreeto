import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, publicProcedure, privateProcedure } from "../trpc";
import { getGoogleUsers } from "../external/google";
import { EventResponseStatus, Membership } from "@agreeto/db";

export const userRouter = router({
  // TESTING PROCEDURE
  updateTier: privateProcedure
    .input(
      z.object({
        tier: z.nativeEnum(Membership),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.user.update({
        where: { id: ctx.user.id },
        data: { membership: input.tier },
      });
    }),

  // Get the current user
  me: privateProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: {
        id: ctx.user.id,
      },
    });
    return user;
  }),

  myAccounts: privateProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.user.id },
      include: { accounts: true },
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

  getFriends: privateProcedure
    .input(
      z.object({
        search: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const accounts = await ctx.prisma.account.findMany({
        where: { userId: ctx.user.id },
      });

      const promises = accounts
        .filter((account) => account.provider === "google")
        .map((account) => {
          return getGoogleUsers({
            search: input.search,
            accessToken: account.access_token,
            refreshToken: account.refresh_token,
          });
        });

      const users = (await Promise.all(promises))
        .flatMap((u) => u)
        .map((u) => ({
          ...u,
          responseStatus: EventResponseStatus.TENTATIVE as EventResponseStatus,
        }));

      return users;
    }),

  changePrimary: privateProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.user.update({
        where: { id: ctx.user.id },
        data: { accountPrimary: { connect: { id: input.id } } },
      });
    }),
});
