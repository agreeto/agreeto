import type { AppRouter } from "@agreeto/api";
import { createTRPCReact } from "@trpc/react-query";
import { transformer } from "@agreeto/api/transformer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, loggerLink } from "@trpc/client";
import React from "react";

// note (richard): wrapping env var in getter to have api consistency w/ nextjs app (which has additional SSR logic in there)
export const getBaseUrl = () => process.env.PLASMO_PUBLIC_WEB_URL;
// const NODE_ENV = import.meta.env.VITE_NODE_ENV;
const NODE_ENV = process.env.NODE_ENV;

/** React Hooks for interacting with the trpc api from @agreeto/api */
export const trpc = createTRPCReact<AppRouter>();

/** Context Provider */
export const TRPCProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [queryClient] = React.useState(() => new QueryClient());
  const [trpcClient] = React.useState(() =>
    trpc.createClient({
      transformer,
      links: [
        loggerLink({
          enabled: (opts) =>
            NODE_ENV === "development" ||
            (opts.direction === "down" && opts.result instanceof Error),
        }),
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          async headers() {
            const token = window?.localStorage.getItem("token");
            return {
              Authorization: `Bearer ${token}`,
            };
          },
        }),
      ],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
};
