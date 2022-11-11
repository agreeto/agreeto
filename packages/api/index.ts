import { type inferRouterOutputs, type inferRouterInputs } from "@trpc/server";
import { type AppRouter } from "./src/router/_app";

export { type AppRouter };
export { appRouter } from "./src/router/_app";

export type { Context } from "./src/context";
export { createContext } from "./src/context";

export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
