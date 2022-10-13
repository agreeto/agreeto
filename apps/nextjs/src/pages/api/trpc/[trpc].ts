// src/pages/api/trpc/[trpc].ts

import type { NextApiRequest, NextApiResponse } from "next";
import { createNextApiHandler } from "@trpc/server/adapters/next";
import { appRouter, createContext } from "@acme/api";
import NextCors from "nextjs-cors";
import { clientEnv } from "../../../env/schema.mjs";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Enable cors
  await NextCors(req, res, {
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    // whitelist our extension's origin
    origin: `https://${clientEnv.NEXT_PUBLIC_EXTENSION_ID}.chromiumapp.org/`,
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  });

  // after cors, now we can mount the tRPC handler
  return createNextApiHandler({
    router: appRouter,
    createContext,
  })(req, res);
};

export default handler;
