import { type AppRouter } from "@agreeto/api";
import { transformer } from "@agreeto/api/transformer";
import { httpBatchLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import { env } from "../env/server.mjs";

const getBaseUrl = () => {
  if (typeof window !== "undefined") return ""; // browser should use relative url
  if (env.VERCEL_URL) return `https://${env.VERCEL_URL}`; // SSR should use vercel url

  return `http://${env.HOST}:${env.PORT ?? 3000}`; // dev SSR should use localhost
};

export const trpc = createTRPCNext<AppRouter>({
  config() {
    return {
      transformer,
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
        }),
      ],
    };
  },
  ssr: false,
});
