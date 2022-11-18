import { type Prisma } from "@agreeto/db";
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
    return user.stripeCustomerId;
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

  return updated.stripeCustomerId;
};

export const stripeRouter = router({
  checkout: router({
    create: privateProcedure.mutation(async ({ ctx }) => {
      const customerId = await getCustomerId(ctx.user.id, ctx.prisma);

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
      });

      if (!session || !session.url)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create Stripe checkout session",
        });

      return { checkoutUrl: session.url };
    }),
  }),

  // Webhooks for Stripe events, server-called by Next.js API router
  webhooks: router({
    invoice: router({
      paid: stripeWHProcedure.mutation(async () => {
        /** no-op */
      }),
      failed: stripeWHProcedure.mutation(async () => {
        /** no-op */
      }),
    }),
    subscription: router({
      updated: stripeWHProcedure.mutation(async () => {
        /** no-op */
      }),
    }),
  }),
});
