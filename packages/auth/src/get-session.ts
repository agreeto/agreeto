import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next";
import { unstable_getServerSession } from "next-auth";

import { getAuthOptions } from "./auth-options";

export const getServerSession = async (
  ctx:
    | {
        req: GetServerSidePropsContext["req"];
        res: GetServerSidePropsContext["res"];
      }
    | { req: NextApiRequest; res: NextApiResponse }
) => {
  const authOptions = getAuthOptions({
    // FIXME: How do we get the env's here? Do we even need them, or are empty strings ok?
    secret: process.env.NEXTAUTH_SECRET ?? "supersecret",
    googleClientId: "",
    googleClientSecret: "",
    azureAdClientId: "",
    azureAdClientSecret: "",
    azureAdTenantId: "",
  });
  return await unstable_getServerSession(ctx.req, ctx.res, authOptions);
};
