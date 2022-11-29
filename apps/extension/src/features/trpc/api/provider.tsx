import { transformer } from "@agreeto/api/transformer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, loggerLink } from "@trpc/client";
import React from "react";

import { getStorageToken } from "~features/trpc/chrome/storage";

import { trpcApi } from "./hooks";

export const TRPCProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [queryClient] = React.useState(() => new QueryClient());
  const [trpcClient] = React.useState(() =>
    trpcApi.createClient({
      transformer,
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === "development" ||
            (opts.direction === "down" && opts.result instanceof Error),
        }),
        httpBatchLink({
          url: `${process.env.PLASMO_PUBLIC_WEB_URL}/api/trpc`,
          async headers() {
            const { token, status } = await getStorageToken();

            return status === "success"
              ? {
                  authorization: `Bearer ${token}`,
                }
              : {};
          },
        }),
      ],
    }),
  );

  return (
    <trpcApi.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpcApi.Provider>
  );
};
