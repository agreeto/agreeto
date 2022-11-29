import type { NextApiRequest, NextApiResponse } from "next";
import {
  appRouter,
  createContext,
  stripe,
  getHTTPStatusCodeFromError,
  TRPCError,
} from "@agreeto/api";

import { env } from "../../../env/server.mjs";

// Stripe requires the raw body to construct the event.
import { buffer } from "micro";
export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const sig = req.headers["stripe-signature"] as string;
  const buf = await buffer(req);

  const event = stripe.webhooks.constructEvent(
    buf,
    sig,
    env.STRIPE_WEBHOOK_SECRET,
  );

  const ctx = await createContext({ req, res });
  const caller = appRouter.createCaller(ctx);
  try {
    switch (event.type) {
      case "invoice.payment_succeeded":
        await caller.stripe.webhooks.invoice.paid({ event });
        break;
      case "customer.deleted":
        await caller.stripe.webhooks.customer.deleted({ event });
        break;
      case "customer.subscription.updated":
        await caller.stripe.webhooks.subscription.updated({ event });
        break;
      case "customer.subscription.trial_will_end":
        await caller.stripe.webhooks.subscription.trialWillEnd({ event });
        break;
      case "customer.subscription.deleted":
        await caller.stripe.webhooks.subscription.deleted({ event });
        break;

      default:
      // console.log("Unhandled Stripe event type", event.type);
    }

    res.status(200).json({ success: true });
  } catch (cause) {
    // Error occured in the tRPC webhook handlers
    if (cause instanceof TRPCError) {
      console.error(`Error in tRPC webhook handler for ${event.type}`, cause);
      const errorCode = getHTTPStatusCodeFromError(cause);
      res.status(errorCode).json({
        error: {
          code: cause.code,
          message: cause.message,
        },
      });
    } else {
      // Error occured outside of tRPC
      console.error("Error in Next.js API route", cause);
      res.status(500).json({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        },
      });
    }
  }
};

export default handler;
