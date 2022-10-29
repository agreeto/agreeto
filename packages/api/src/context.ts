import { type inferAsyncReturnType } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { prisma } from "@agreeto/db";
// import { getServerSession } from "@acme/auth";
import { getToken, type JWTToken } from "@agreeto/auth";

export type CreateContextOptions = {
  token: JWTToken | null;
  // session: Awaited<ReturnType<typeof getServerSession>>;
  // user: Awaited<ReturnType<typeof prisma.user.findUnique>>;
};

/** Use this helper for:
 * - testing, so we dont have to mock Next.js' req/res
 * - trpc's `createSSGHelpers` where we don't have req/res
 * @see https://beta.create.t3.gg/en/usage/trpc#-servertrpccontextts
 **/
export const createContextInner = async ({ token }: CreateContextOptions) => {
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
export const createContext = async ({ req }: CreateNextContextOptions) => {
  console.log("secret: ", process.env.NEXTAUTH_SECRET);
  const token = await getToken({ req });
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

export type Context = inferAsyncReturnType<typeof createContext>;
