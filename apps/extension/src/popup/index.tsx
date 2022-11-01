// note (richard): import order is important to not run into specificity issues
import "@fullcalendar/common/main.css"
import "@fullcalendar/timegrid/main.css"
import "../style.css"

import { Outlet, ReactLocation, Router } from "@tanstack/react-location"
import React from "react"

import { Layout } from "~app/layout"
import { getRoutes, reactLocationOptions } from "~features/router/config"
import { TRPCProvider } from "~features/trpc//api/provider"
import { trpcApi } from "~features/trpc/api/hooks"
import { storage } from "~features/trpc/chrome/storage"

/**
 * Custom hook to get the accessToken from storage
 * and validate it with the server
 * @returns boolean whether the token is valid or not
 */
const useIsAuthed = () => {
  const [isAuthed, setIsAuthed] = React.useState(false)

  const validateToken = trpcApi.session.validate.useMutation({
    onSuccess() {
      setIsAuthed(true)
    },
    async onError() {
      // TODO: call with trpc-chrome, update others?
      // await storage.set("accessToken", "")
    }
  })

  // Validate the token on server
  React.useEffect(() => {
    storage.get("accessToken").then((token) => {
      console.log(token)
      validateToken.mutate({ token })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return isAuthed
}

const signIn = () => {
  window.open(
    `http://localhost:3000/api/auth/signin?${new URLSearchParams({
      callbackUrl: `${process.env.PLASMO_PUBLIC_WEB_URL}/auth/extension`
    })}`
  )
}

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
const PopupContent: React.FC = () => {
  const isAuthed = useIsAuthed()

  const [location] = React.useState(
    () => new ReactLocation(reactLocationOptions)
  )

  return (
    <Router routes={getRoutes()} location={location}>
      {/* maximum size of popup */}
      <div className="w-[800] h-[600]">
        {isAuthed ? (
          /** THE ACTUAL APP */
          <Layout>
            <Outlet />
          </Layout>
        ) : (
          /** OR: SIGN IN */
          // <SignIn />
          <div>
            Sign in to use the extension. <br />
            <button
              className="text-white bg-blue-500 border border-blue-500 hover:ring hover:ring-yellow-500"
              onClick={signIn}>
              Sign In
            </button>
          </div>
        )}
      </div>
    </Router>
  )
}

/** Content needs access to the tRPC context, so we need a wrapper */
const IndexPopup: React.FC = () => {
  return (
    <TRPCProvider>
      <PopupContent />
    </TRPCProvider>
  )
}

export default IndexPopup
