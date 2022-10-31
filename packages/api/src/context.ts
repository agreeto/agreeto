import type { inferAsyncReturnType } from "@trpc/server";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import {
  // getToken,
  getServerSession,
  // type JWTToken,
  type Session,
  type User,
} from "@agreeto/auth";
import { prisma } from "@agreeto/db";

export type CreateContextOptions = {
  // token: JWTToken | null;
  session: Session | null;
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
    // token: opts.token,
    session: opts.session,
    user: opts.user,
  };
};

/**
 * This is the actual context you'll use in your router
 * @link https://trpc.io/docs/context
 **/
export const createContext = async ({ req, res }: CreateNextContextOptions) => {
  // const token = await getToken({ req });
  // console.log("token from trpc context");
  // console.dir({ token }, { depth: 2 });
  // console.log("\n");

  const session = await getServerSession({ req, res });
  console.log("session from trpc context");
  console.dir({ session }, { depth: 2 });

  return await createContextInner({ session, user: session?.user });
};

export type Context = inferAsyncReturnType<typeof createContext>;
