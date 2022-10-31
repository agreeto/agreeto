// note (richard): import order is important to not run into specificity issues
import "@fullcalendar/common/main.css"
import "@fullcalendar/timegrid/main.css"
import "../style.css"

import { Outlet, ReactLocation, Router } from "@tanstack/react-location"
import React from "react"

import { useStorage } from "@plasmohq/storage/hook"

import { Layout } from "~app/layout"
import { SignIn } from "~features/auth"
import { getRoutes, reactLocationOptions } from "~features/router/config"
import { TRPCProvider } from "~features/trpc//api/provider"
import { ChromeStorage } from "~features/trpc/chrome/storage"

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
const _isDev = process.env.NODE_ENV === "development"
function IndexPopup() {
  const [accessTokenValue] = useStorage({
    key: "accessToken",
    isSecret: true
  })
  const accessToken = ChromeStorage.accessToken.safeParse(accessTokenValue)
  const isAuthenticated = !!accessToken.success

  const [location] = React.useState(
    () => new ReactLocation(reactLocationOptions)
  )

  return (
    <TRPCProvider>
      <Router routes={getRoutes()} location={location}>
        {/* maximum size of popup */}
        <div className="w-[800] h-[600]">
          <Layout>
            {isAuthenticated ? (
              /** THE ACTUAL APP */
              <Outlet />
            ) : (
              /** OR: SIGN IN */
              <SignIn />
            )}
          </Layout>
        </div>
      </Router>
    </TRPCProvider>
  )
}

export default IndexPopup
