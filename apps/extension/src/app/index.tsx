import { Outlet, ReactLocation, Router } from "@tanstack/react-location"
import React from "react"

import { useIsAuthed } from "~features/auth/is-authed"
import { SignIn } from "~features/auth/sign-in"
import { getRoutes, reactLocationOptions } from "~features/router/config"
import { TRPCProvider } from "~features/trpc/api/provider"

import { Layout } from "./layout"

const AppContent: React.FC = () => {
  const isAuthed = useIsAuthed()
  // const utils = trpcApi.useContext()

  const [location] = React.useState(
    () => new ReactLocation(reactLocationOptions)
  )

  return (
    <Router location={location} routes={getRoutes()}>
      <div className="h-[600] w-[800]">
        {isAuthed ? (
          // Render app layout if user is authed
          <Layout>
            <Outlet />
          </Layout>
        ) : (
          // Render sign in page if user is not authed
          <SignIn />
        )}
      </div>
    </Router>
  )
}

export const App: React.FC = () => {
  return (
    <TRPCProvider>
      <AppContent />
    </TRPCProvider>
  )
}
