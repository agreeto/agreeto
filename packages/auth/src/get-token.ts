import type { GetServerSidePropsContext, NextApiRequest } from "next";
import { getToken as $getToken } from "next-auth/jwt";

export const getToken = async (ctx: {
  req: GetServerSidePropsContext["req"] | NextApiRequest;
}) => {
  // FIXME: look into the env-var situation in combination with auth-options
  return await $getToken({ req: ctx.req, secret: process.env.NEXTAUTH_SECRET });
};
