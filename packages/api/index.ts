import { type inferRouterOutputs, type inferRouterInputs } from "@trpc/server";
export { getHTTPStatusCodeFromError } from "@trpc/server/http";
export { TRPCError } from "@trpc/server";

import { type AppRouter } from "./src/router/_app";

export { type AppRouter };
export { appRouter } from "./src/router/_app";

export type { Context } from "./src/context";
export { createContext } from "./src/context";

import { stripe } from "./src/router/stripe";
type Stripe = typeof stripe;
export { stripe, type Stripe };

export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
