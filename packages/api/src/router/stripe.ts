import { Language, Membership, type Prisma } from "@agreeto/db";
import { TRPCError } from "@trpc/server";
import { Stripe } from "stripe";
import { z } from "zod";
import { router, publicProcedure, privateProcedure } from "../trpc";

export const stripe = new Stripe(process.env.STRIPE_SK as string, {
  apiVersion: "2022-11-15",
});

const stripeWHProcedure = publicProcedure
  .input(
    z.object({
      // From type Stripe.Event
      event: z.object({
        id: z.string(),
        api_version: z.string().nullish(),
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
        pending_webhooks: z.number(),
      }),
    }),
  )
  .use(async ({ ctx, input, next }) => {
    console.log("Incoming Stripe Webhook", input.event);

    // Let the handler run
    const result = await next();

    // Log event to DB
    const { event } = input;
    await ctx.prisma.stripeEvent.create({
      data: {
        id: event.id,
        type: event.type,
        object: event.object,
        api_version: event.api_version,
        account: event.account,
        created: new Date(event.created * 1000), // convert to milliseconds
        data: {
          object: event.data.object,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          previous_attributes: (event.data as any).previous_attributes,
        },
        livemode: event.livemode,
        pending_webhooks: event.pending_webhooks,
        request: {
          id: event.request?.id,
          idempotency_key: event.request?.idempotency_key,
        },
      },
    });
    return result;
  });

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
          trial_period_days: !user.hasTrialed ? 7 : undefined,
          metadata: {
            userId: ctx.user.id,
          },
        },
        // allow starting trials without payment
        payment_method_collection: "if_required",
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
        return_url: process.env.NEXTAUTH_URL,
      });
      return session;
    }),
  }),

  // Webhooks for Stripe events, server-called by Next.js API endpoint
  webhooks: router({
    customer: router({
      deleted: stripeWHProcedure.mutation(async ({ ctx, input }) => {
        const { event } = input;
        const { object } = event.data;
        const { id } = object as Stripe.Customer;

        console.log(event);
        // TODO: Prob make stripeCustomerId unique
        await ctx.prisma.user.updateMany({
          where: { stripeCustomerId: id },
          data: { stripeCustomerId: null },
        });
      }),
    }),
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
          // ctx.prisma.user.update({
          //   where: { id: userId },
          //   data: {
          //     membership,
          //     paidUntil: new Date(invoice.period_end * 1000),
          //   },
          // }),
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

    // Occurs whenever a source's details are changed
    subscription: router({
      created: stripeWHProcedure.mutation(async ({ ctx, input }) => {
        const subscription = input.event.data.object as Stripe.Subscription;
        const { userId } = subscription.metadata;

        await ctx.prisma.user.update({
          where: { id: userId },
          data: {
            // consume trial
            hasTrialed: subscription.status === "trialing" ? true : undefined,
            subscriptionStatus: subscription.status,
          },
        });
      }),
      updated: stripeWHProcedure.mutation(async ({ ctx, input }) => {
        const subscription = input.event.data.object as Stripe.Subscription;
        const { userId } = subscription.metadata;

        // NOTE: Just cause we get cancelled doesn't mean we should end the
        // membership, as the subscription is still active until the end of the
        // billing period. We get a separete `delete` event for that ⬇️⬇️⬇️

        const canceledAt = subscription.canceled_at
          ? new Date(subscription.canceled_at * 1000)
          : null;

        await Promise.all([
          ctx.prisma.user.update({
            where: { id: userId },
            data: {
              paidUntil: new Date(subscription.current_period_end * 1000),
              subscriptionCanceledDate: canceledAt,
              subscriptionStatus: subscription.status,
            },
          }),
          ctx.prisma.payment.updateMany({
            where: { subscriptionId: subscription.id },
            data: {
              canceledDate: canceledAt,
            },
          }),
        ]);
      }),

      trialWillEnd: stripeWHProcedure.mutation(async ({ input }) => {
        const subscription = input.event.data.object as Stripe.Subscription;
        const { userId } = subscription.metadata;
        console.log("Trial ending for user", userId);

        // Send email using Nodemailer?
      }),

      // Occurs whenever a customer's subscription ends
      // We use this to update the user's membership and reset their premium features
      deleted: stripeWHProcedure.mutation(async ({ ctx, input }) => {
        const subscription = input.event.data.object as Stripe.Subscription;
        const { userId } = subscription.metadata;

        await Promise.all([
          ctx.prisma.user.update({
            where: { id: userId },
            data: {
              paidUntil: null,
              subscriptionCanceledDate: new Date(),
              subscriptionStatus: subscription.status,
              membership: Membership.FREE,
              preference: {
                update: {
                  formatLanguage: Language.EN,
                },
              },
            },
          }),
          ctx.prisma.payment.updateMany({
            where: {
              subscriptionId: subscription.id,
              // This might already have been updated ⬆️⬆️⬆️, so we only update the `null` ones
              canceledDate: null,
            },
            data: {
              canceledDate: new Date(),
            },
          }),
        ]);
      }),
    }),
  }),
});
