// src/server/router/context.ts
import * as trpc from "@trpc/server";
// import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import * as trpcNext from "@trpc/server/adapters/next";
import { prisma } from "@agreeto/db";
// import { getServerSession } from "@acme/auth";
import { getToken } from "next-auth/jwt";

/**
 * Replace this with an object if you want to pass things to createContextInner
 */
export type CreateContextOptions = Record<string, never>;

/** Use this helper for:
 *  - testing, where we dont have to Mock Next.js' req/res
 *  - trpc's `createSSGHelpers` where we don't have req/res
 */
export const createContextInner = async ({
  token,
}: // session,
// user,
{
  // session: Awaited<ReturnType<typeof getServerSession>>;
  // user: Awaited<ReturnType<typeof prisma.user.findUnique>>;
  token: Awaited<ReturnType<typeof getToken>>;
}) => {
  return {
    prisma,
    token,
    // session,
    // user,
  };
};

/**
 * This is the actual context you'll use in your router
 * @link https://trpc.io/docs/context
 **/

export const createContext = async ({
  req,
}: trpcNext.CreateNextContextOptions) => {
  // FIXME: include env var dep in turbo.json
  // eslint-disable-next-line
  console.log("secret: ", process.env.NEXTAUTH_SECRET);
  // FIXME: getToken currently returns `null`, currently unsure why (richard)
  // FIXME: include env var dep in turbo.json
  // eslint-disable-next-line
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  console.log("|||||||||||||||||");
  console.dir({ token }, { depth: 2 });
  console.log("|||||||||||||||||");

  return await createContextInner({ token });
};

/**
 * This functions fetched the user from the database using NextAuth's session email.
 *
 * @param options a bag containting the session and the req/res from CreeateNextContextOptions
 * @returns
 */
// async function getUserFromSession({
//   session,
//   req,
//   res,
// }: {
//   session: Awaited<ReturnType<typeof getServerSession>>;
// } & trpcNext.CreateNextContextOptions) {
//   const token = getToken();
//   if (!req.headers.authorization) {
//     return null;
//   }
//   if (!session?.user?.email) {
//     return null;
//   }
//   const user = await prisma.user.findUnique({
//     where: { email: session.user.email },
//   });
//   if (!user) {
//     return null;
//   }
//   return user;
// }

export type Context = trpc.inferAsyncReturnType<typeof createContext>;
