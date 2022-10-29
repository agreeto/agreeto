// src/server/router/context.ts
import * as trpc from "@trpc/server";
// import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import * as trpcNext from "@trpc/server/adapters/next";
import { prisma } from "@agreeto/db";

/**
 * Replace this with an object if you want to pass things to createContextInner
 */
type CreateContextOptions = Record<string, never>;

/** Use this helper for:
 *  - testing, where we dont have to Mock Next.js' req/res
 *  - trpc's `createSSGHelpers` where we don't have req/res
 */
export const createContextInner = async (opts: CreateContextOptions) => {
  return {
    prisma,
  };
};

/**
 * This is the actual context you'll use in your router
 * @link https://trpc.io/docs/context
 **/
export const createContext = async (
  opts: trpcNext.CreateNextContextOptions
) => {
  return await createContextInner({});
};
// /**
//  * This is the actual context you'll use in your router
//  * @link https://trpc.io/docs/context
//  **/
// export const createContextFetch = async (opts: FetchCreateContextFnOptions) => {
//   return await createContextInner({});
// };

export type Context = trpc.inferAsyncReturnType<typeof createContext>;
