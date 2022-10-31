import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { httpBatchLink } from "@trpc/client"
import React from "react"

import { getStorageToken } from "~features/trpc/chrome/storage"

import { trpcApi } from "./index"

export const TRPCProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [queryClient] = React.useState(() => new QueryClient())
  const [trpcClient] = React.useState(() =>
    trpcApi.createClient({
      links: [
        httpBatchLink({
          url: `${process.env.PLASMO_PUBLIC_WEB_URL}/api/trpc`,
          async headers() {
            const { token, status } = getStorageToken()

            return status === "success"
              ? {
                  authorization: `Bearer ${token}`
                }
              : {}
          }
        })
      ]
    })
  )

  return (
    <trpcApi.Provider queryClient={queryClient} client={trpcClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpcApi.Provider>
  )
}
