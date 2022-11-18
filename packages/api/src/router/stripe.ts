import { Language, Membership, type Prisma } from "@agreeto/db";
import { TRPCError } from "@trpc/server";
import { Stripe } from "stripe";
import { z } from "zod";
import { router, publicProcedure, privateProcedure } from "../trpc";

export const stripe = new Stripe(process.env.STRIPE_SK as string, {
  apiVersion: "2022-11-15",
});

const stripeWHProcedure = publicProcedure.input(
  z.object({
    // From type Stripe.Event
    event: z.object({
      id: z.string(),
      object: z.enum(["event"]),
      account: z.string().nullish(),
      created: z.number(),
      data: z.object({
        object: z.record(z.any()),
      }),
      request: z
        .object({
          id: z.string().nullish(),
          idempotency_key: z.string().nullish(),
        })
        .nullish(),
      livemode: z.boolean(),
      type: z.string(),
    }),
  }),
);

// Gets the Stripe customer ID for the current user, or creates one if it doesn't exist
const getCustomerId = async (userId: string, prisma: Prisma) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  // Should never happen as long as we call this in protected procedures
  if (!user)
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "User not found in database",
    });

  if (user.stripeCustomerId) {
    return { customerId: user.stripeCustomerId, user };
  }

  // Create a new customer
  const customer = await stripe.customers.create({
    email: user.email ?? undefined,
    metadata: {
      userId: user.id,
    },
  });

  // Update the user with the new customer ID
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { stripeCustomerId: customer.id },
  });

  if (!updated.stripeCustomerId)
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to create Stripe customer",
    });

  return { customerId: updated.stripeCustomerId, user };
};

export const stripeRouter = router({
  checkout: router({
    create: privateProcedure.mutation(async ({ ctx }) => {
      const { customerId, user } = await getCustomerId(ctx.user.id, ctx.prisma);

      if (
        user.paidUntil &&
        user.paidUntil > new Date() &&
        user.membership !== Membership.FREE
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User already has a paid membership",
        });
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        client_reference_id: ctx.user.id,
        payment_method_types: ["card"],
        mode: "subscription",
        line_items: [
          {
            price: process.env.STRIPE_MONTHLY_PRICE_ID,
            quantity: 1,
          },
        ],
        success_url: `${process.env.NEXTAUTH_URL}/payment/success`,
        cancel_url: `${process.env.NEXTAUTH_URL}/payment/cancel`,
        subscription_data: {
          metadata: {
            userId: ctx.user.id,
          },
        },
      });

      if (!session || !session.url)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create Stripe checkout session",
        });

      return { checkoutUrl: session.url };
    }),
  }),

  subscription: router({
    createBillingPortalSession: privateProcedure.mutation(async ({ ctx }) => {
      const { customerId } = await getCustomerId(ctx.user.id, ctx.prisma);
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${process.env.NEXTAUTH_URL}/dashboard`,
      });
      return session;
    }),
  }),

  // Webhooks for Stripe events, server-called by Next.js API router
  webhooks: router({
    invoice: router({
      paid: stripeWHProcedure.mutation(async ({ ctx, input }) => {
        // Extract out metadata which contains some user info
        const invoice = input.event.data.object as Stripe.Invoice;
        const subscription = await stripe.subscriptions.retrieve(
          invoice.subscription as string,
        );
        const { userId } = subscription.metadata;

        const lineItem = invoice.lines.data[0];
        const priceId = lineItem?.plan?.id;
        if (!priceId) throw new TRPCError({ code: "BAD_REQUEST" });

        const membership =
          priceId === process.env.STRIPE_MONTHLY_PRICE_ID
            ? Membership.PRO
            : Membership.PREMIUM;

        // Update the user's membership, and register the payment
        await Promise.all([
          ctx.prisma.user.update({
            where: { id: userId },
            data: { membership },
          }),
          ctx.prisma.payment.create({
            data: {
              user: { connect: { id: userId } },
              email: invoice.customer_email as string,
              membershipPlan: priceId,
              membership,
              subscriptionId: subscription.id,
              customerId: subscription.customer as string,
              eventId: input.event.id,
              // Multiply with 1000 to convert it into ms
              membershipStartDate: new Date(lineItem.period.start * 1000),
              membershipEndDate: new Date(lineItem.period.end * 1000),
            },
          }),
        ]);
      }),
      failed: stripeWHProcedure.mutation(async () => {
        /** no-op */
      }),
    }),
    subscription: router({
      updated: stripeWHProcedure.mutation(async ({ ctx, input }) => {
        const subscription = input.event.data.object as Stripe.Subscription;
        const { userId } = subscription.metadata;

        const canceledDate = subscription.cancel_at
          ? new Date(subscription.cancel_at * 1000)
          : null;

        await Promise.all([
          ctx.prisma.user.update({
            where: { id: userId },
            data: {
              subscriptionCanceledDate: canceledDate,
              // update the membership if the subscription is canceled
              membership: canceledDate ? Membership.FREE : undefined,
              preference: {
                update: {
                  // reset the preference if the subscription is canceled
                  formatLanguage: canceledDate ? Language.EN : undefined,
                },
              },
            },
          }),
          ctx.prisma.payment.updateMany({
            where: { subscriptionId: subscription.id },
            data: {
              canceledDate,
            },
          }),
        ]);
      }),
    }),
  }),
});
