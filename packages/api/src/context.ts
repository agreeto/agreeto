import type { inferAsyncReturnType } from "@trpc/server";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import { getServerSession, type User } from "@agreeto/auth";
import { prisma } from "@agreeto/db";

export type CreateContextOptions = {
  session: inferAsyncReturnType<typeof getServerSession>;
  user: User | undefined;
};

/** Use this helper for:
 * - testing, so we dont have to mock Next.js' req/res
 * - trpc's `createSSGHelpers` where we don't have req/res
 * @see https://beta.create.t3.gg/en/usage/trpc#-servertrpccontextts
 **/
export const createContextInner = async (opts: CreateContextOptions) => {
  return {
    prisma,
    session: opts.session,
    user: opts.user,
  };
};

/**
 * This is the actual context you'll use in your router
 * @link https://trpc.io/docs/context
 **/
export const createContext = async ({ req, res }: CreateNextContextOptions) => {
  const session = await getServerSession({ req, res });

  return await createContextInner({
    session: session,
    user: session?.user,
  });
};

export type Context = inferAsyncReturnType<typeof createContext>;
