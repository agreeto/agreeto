import { router, publicProcedure, privateProcedure } from "../trpc";
import { getMembershipFromPriceId } from "./stripe";
import {
  EventResponseStatus,
  Membership,
  StripeSubscriptionStatus,
} from "@agreeto/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getGoogleWorkspaceUsers } from "../external/google";
import { isGoogleWorkspaceAccount } from "../services/service-helpers";
import { EventColorDirectoryUserRadix } from "@agreeto/db/client-types";

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

  validateTrial: privateProcedure.mutation(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.user.id },
    });

    // Nothing to do if they're not on a trial
    if (user?.membership !== Membership.TRIAL) return;

    if (user?.trialEnds && user?.trialEnds < new Date())
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Trial has ended",
      });
  }),

  startTrial: privateProcedure.mutation(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.user.id },
    });
    if (!user) throw new TRPCError({ code: "NOT_FOUND" });
    if (user.membership !== Membership.FREE)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Can't start trial on an active subscriber",
      });
    if (user.trialEnds !== null)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User has already trialed",
      });

    return await ctx.prisma.user.update({
      where: { id: user.id },
      data: {
        membership: Membership.TRIAL,
        trialEnds: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days from now
      },
    });
  }),

  endTrial: privateProcedure.mutation(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.user.id },
    });

    if (!user) throw new TRPCError({ code: "NOT_FOUND" });
    if (user.membership !== Membership.TRIAL)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Can't end trial on a non-trial user",
      });

    return await ctx.prisma.user.update({
      where: { id: user.id },
      data: {
        membership: Membership.FREE,
        trialEnds: new Date(),
      },
    });
  }),

  subscription: privateProcedure.query(async ({ ctx }) => {
    const stripeCustomer = await ctx.prisma.user
      .findUnique({
        where: { id: ctx.user.id },
      })
      .stripeCustomer();

    const subscription = await ctx.prisma.stripeSubscription.findFirst({
      where: {
        stripeCustomerId: stripeCustomer?.id,
      },
      orderBy: {
        current_period_end: "desc",
      },
    });

    if (!subscription) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No subscription found",
      });
    }

    if (StripeSubscriptionStatus.active !== subscription.status) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No active subscription found",
      });
    }

    const membership = getMembershipFromPriceId(subscription.priceId);

    const period =
      subscription.priceId === process.env.STRIPE_MONTHLY_PRICE_ID
        ? "monthly"
        : "annually";

    return {
      id: subscription.id,
      status: subscription.status,
      current_period_end: subscription.current_period_end,
      membership,
      period: period as "monthly" | "annually", // FIXME: Why is `as` needed (typed as string on client if not used)
    };
  }),

  myAccounts: privateProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.user.id },
      include: { accounts: true },
    });
    if (!user) throw new TRPCError({ code: "NOT_FOUND" });
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
        occupiedColors: z.nativeEnum(EventColorDirectoryUserRadix).array(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const accounts = await ctx.prisma.account.findMany({
        where: { userId: ctx.user.id },
      });
      const promises = accounts.flatMap((account) => {
        if (!isGoogleWorkspaceAccount(account)) return [];
        // return the Workspace Admin API promise to fetch co-workers
        return getGoogleWorkspaceUsers({
          search: input.search,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
        });
      });

      const colors = Object.values(EventColorDirectoryUserRadix);
      const getAvailableColor = () => {
        const availableColors = colors.filter(
          (color) => !input.occupiedColors.includes(color),
        );
        const color =
          availableColors[Math.floor(Math.random() * availableColors.length)];
        // Fine to non-null assert here because we "know" there's at least one color in the enum
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return color ?? colors[0]!;
      };

      const users = (await Promise.all(promises))
        .flatMap((u) => u)
        .map((u) => ({
          ...u,
          color: getAvailableColor(),
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
