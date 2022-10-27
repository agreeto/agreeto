import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import Layout from "./features/layout"
import { trpc } from "./trpc"

// note (richard): import order is important to not run into specificity issues
import "@fullcalendar/common/main.css"
import "@fullcalendar/timegrid/main.css"
import "./style.css"

import { httpBatchLink } from "@trpc/client"
import { useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import { SignIn } from "~features/auth"
import { Calendar } from "~features/calendar"
import { ChromeStorage } from "~storage-schema"

/**
 * The IndexPopup is the entry-file for the popup script of the extension.
 *
 * It provides the app w/ all global configurations via provicers, e.g.:
 * - trpc
 * - react-query
 *
 * *Before* rendering the providers with the App inside it, it checks authentication.
 * If the user is not authenticated, it will render only the SignIn page
 *
 * @returns `<SignIn />` Page OR `<App/>` wrapped in JSX Providers
 */
const isDev = process.env.NODE_ENV === "development"
function IndexPopup() {
  // Authentication
  const [accessTokenValue] = useStorage({
    key: "accessToken",
    isSecret: true
  })
  const accessToken = ChromeStorage.accessToken.parse(accessTokenValue)
  const isAuthenticated = Boolean(accessToken)

  // Configure tRPC
  const [queryClient] = useState(() => new QueryClient())
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${process.env.PLASMO_PUBLIC_WEB_URL}/api/trpc`,
          headers() {
            return isAuthenticated
              ? {
                  authorization: `Bearer ${accessToken}`
                }
              : {}
          }
        })
      ]
    })
  )

  // Providers
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {/* maximum size of popup */}
        <div className="w-[800] h-[600]">
          {isAuthenticated ? (
            /**
             * THE ACTUAL APP
             */
            <Layout>
              <Calendar />
            </Layout>
          ) : (
            /**
             * OR: SIGN IN
             */
            <SignIn />
          )}
        </div>
      </QueryClientProvider>
    </trpc.Provider>
  )
}

export default IndexPopup
