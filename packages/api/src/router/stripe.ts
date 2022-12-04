import { Language, Membership, type Prisma } from "@agreeto/db";
import { TRPCError } from "@trpc/server";
import { Stripe } from "stripe";
import { z } from "zod";
import { router, publicProcedure, privateProcedure } from "../trpc";

export const stripe = new Stripe(process.env.STRIPE_SK as string, {
  apiVersion: "2022-11-15",
});

export const getMembershipFromPriceId = (
  priceId: string | undefined,
): Membership => {
  switch (priceId) {
    case process.env.STRIPE_MONTHLY_PRICE_ID:
      return Membership.PRO;
    case process.env.STRIPE_ANNUALLY_PRICE_ID:
      return Membership.PREMIUM;
    default:
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Price ID ${priceId} not recognized`,
      });
  }
};

const getStripePriceId = (
  membership: Membership,
  period: "monthly" | "annually",
) => {
  switch (period) {
    // TODO: Differentiate PRO and PREMIUM when PREMIUM is available
    case "monthly":
      return process.env.STRIPE_MONTHLY_PRICE_ID;
    case "annually":
      return process.env.STRIPE_ANNUALLY_PRICE_ID;
    default:
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Period ${period} not recognized`,
      });
  }
};

const getPriceIdFromSubscription = (item: Stripe.Subscription["items"]) => {
  const priceId = item.data[0]?.price.id;
  if (!priceId)
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "No price ID found",
    });
  return priceId;
};

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

    // Let the handler run
    const result = await next();

    return result;
  });

// Gets the Stripe customer ID for the current user, or creates one if it doesn't exist
const getCustomerId = async (userId: string, prisma: Prisma) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      stripeCustomer: {
        include: { subscriptions: true },
      },
    },
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

  // Create customer in db
  await prisma.stripeCustomer.create({
    data: {
      user: {
        connect: { id: user.id },
      },
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: {
        ...customer.address,
      },
      balance: customer.balance,
      description: customer.description,
      created: new Date(customer.created * 1000), // convert to milliseconds
      currency: customer.currency,
      delinquent: !!customer.delinquent,
      livemode: customer.livemode,
      metadata: customer.metadata,
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
    create: privateProcedure
      .input(
        z.object({
          plan: z.enum([Membership.PRO, Membership.PREMIUM]),
          period: z.enum(["monthly", "annually"]),
          success_url: z.string().optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const { customerId, user } = await getCustomerId(
          ctx.user.id,
          ctx.prisma,
        );

        if (
          user.membership !== Membership.FREE &&
          user.membership !== Membership.TRIAL
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
              price: getStripePriceId(input.plan, input.period),
              quantity: 1,
            },
          ],

          success_url:
            input.success_url ??
            `${
              process.env.NEXTAUTH_URL ?? process.env.VERCEL_URL
            }/payment/success`,
          cancel_url: `${
            process.env.NEXTAUTH_URL ?? process.env.VERCEL_URL
          }/payment/cancel`,
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
        return_url: process.env.NEXTAUTH_URL ?? process.env.VERCEL_URL,
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

        const isTrial = subscription.status === "trialing";
        const membership = isTrial
          ? Membership.TRIAL
          : getMembershipFromPriceId(priceId);

        // These queries are executed in order
        await ctx.prisma.$transaction([
          // First create the subscription in the db

          ctx.prisma.stripeSubscription.create({
            data: {
              id: subscription.id,
              cancel_at_period_end: subscription.cancel_at_period_end,
              collection_method: subscription.collection_method,
              livemode: subscription.livemode,
              metadata: subscription.metadata,
              start_date: new Date(subscription.start_date * 1000),
              status: subscription.status,
              stripeCustomer: {
                connect: { id: subscription.customer as string },
              },
              priceId: getPriceIdFromSubscription(subscription.items),
              current_period_start: new Date(
                subscription.current_period_start * 1000,
              ),
              current_period_end: new Date(
                subscription.current_period_end * 1000,
              ),
              created: new Date(subscription.created * 1000), // convert to milliseconds
              canceled_at: subscription.canceled_at
                ? new Date(subscription.canceled_at * 1000)
                : null,
              ended_at: subscription.ended_at
                ? new Date(subscription.ended_at * 1000)
                : null,
              trial_start: subscription.trial_start
                ? new Date(subscription.trial_start * 1000)
                : null,
              trial_end: subscription.trial_end
                ? new Date(subscription.trial_end * 1000)
                : null,
            },
          }),
          ctx.prisma.user.update({
            where: { id: userId },
            data: {
              // consume trial
              hasTrialed: isTrial || undefined,
              membership,
            },
          }),
          ctx.prisma.invoice.create({
            data: {
              id: invoice.id,
              user: { connect: { id: userId } },
              subscription: { connect: { id: subscription.id } },
              customer: { connect: { id: invoice.customer as string } },
              event: { connect: { id: input.event.id } },
              email: invoice.customer_email as string,
              membershipPlan: priceId,
              membership,
              created: new Date(invoice.created * 1000), // convert to milliseconds
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
      // created: handled in invoice.paid

      updated: stripeWHProcedure.mutation(async ({ ctx, input }) => {
        const subscription = input.event.data.object as Stripe.Subscription;
        const { userId } = subscription.metadata;
        const isTrial = subscription.status === "trialing";

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
              membership: isTrial
                ? Membership.TRIAL
                : getMembershipFromPriceId(
                    subscription.items.data[0]?.price.id,
                  ),
            },
          }),
          ctx.prisma.stripeSubscription.update({
            where: { id: subscription.id },
            data: {
              cancel_at_period_end: subscription.cancel_at_period_end,
              collection_method: subscription.collection_method,
              livemode: subscription.livemode,
              metadata: subscription.metadata,
              status: subscription.status,
              invoices: {
                connect: { id: subscription.latest_invoice as string },
              },
              current_period_start: new Date(
                subscription.current_period_start * 1000,
              ),
              current_period_end: new Date(
                subscription.current_period_end * 1000,
              ),
              canceled_at: canceledAt,
              ended_at: subscription.ended_at
                ? new Date(subscription.ended_at * 1000)
                : undefined,
              trial_start: subscription.trial_start
                ? new Date(subscription.trial_start * 1000)
                : undefined,
              trial_end: subscription.trial_end
                ? new Date(subscription.trial_end * 1000)
                : undefined,
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
              membership: Membership.FREE,
              preference: {
                update: {
                  formatLanguage: Language.EN,
                },
              },
            },
          }),
          ctx.prisma.stripeSubscription.update({
            where: { id: subscription.id },
            data: {
              canceled_at: subscription.canceled_at
                ? new Date(subscription.canceled_at * 1000)
                : undefined,
              ended_at: subscription.ended_at
                ? new Date(subscription.ended_at * 1000)
                : undefined,
            },
          }),
        ]);
      }),
    }),
  }),
});
