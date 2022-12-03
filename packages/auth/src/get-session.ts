import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next";
import { unstable_getServerSession } from "next-auth";

import { prisma } from "@agreeto/db";

import { authOptions } from "./auth-options";

export const getServerSession = async (
  ctx:
    | {
        req: GetServerSidePropsContext["req"];
        res: GetServerSidePropsContext["res"];
      }
    | { req: NextApiRequest; res: NextApiResponse },
) => {
  const session = await unstable_getServerSession(
    ctx.req,
    ctx.res,
    authOptions,
  );
  if (session) {
    return session;
  }

  const sessionToken = ctx.req.headers.authorization;
  if (!sessionToken?.startsWith("Bearer ")) {
    return null;
  }

  const dbSession = await prisma.session.findUnique({
    where: {
      sessionToken: sessionToken.replace("Bearer ", ""),
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          membership: true,
        },
      },
    },
  });

  return dbSession;
};
