import { transformer } from "@agreeto/api/transformer";
import { TRPCError, initTRPC } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.context().create({
  isServer: false,
  allowOutsideOfServer: true,
  transformer,
  errorFormatter({ shape }) {
    return shape;
  },
});

export const chromeRouter = t.router({
  getAccessToken: t.procedure.query(async () => {
    const token = await chrome.storage.sync.get("accessToken");

    if (!token || typeof token.accessToken !== "string") {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "No access token found in your browser's storage",
      });
    }

    return token.accessToken;
  }),

  openTab: t.procedure.input(z.string().url()).mutation(async ({ input }) => {
    await chrome.tabs.create({ url: input });
  }),
});

// export type definition of API
export type ChromeRouter = typeof chromeRouter;
