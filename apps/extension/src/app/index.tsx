import { Outlet, ReactLocation, Router } from "@tanstack/react-location"

import { useIsAuthed } from "~features/auth/is-authed"
import { SignIn } from "~features/auth/sign-in"
import { reactLocationOptions } from "~features/router/config"
import { Calendar } from "~features/router/routes/calendar"
import { Settings } from "~features/router/routes/settings"
import { trpcApi } from "~features/trpc/api/hooks"
import { TRPCProvider } from "~features/trpc/api/provider"

import { Layout } from "./layout"

const location = new ReactLocation(reactLocationOptions)

const AppContent: React.FC = () => {
  const isAuthed = useIsAuthed()
  const utils = trpcApi.useContext()

  return (
    <Router
      location={location}
      routes={[
        {
          path: "/",
          element: <SignIn />,
          children: [
            {
              path: "calendar",
              // loader: async () => {
              //   const user = await utils.user.current.fetch()
              //   const events = await utils.post.all.fetch()
              //   return { user, events }
              // },
              element: <Calendar />
            },
            {
              path: "settings",
              element: <Settings />,
              // TODO: add account fetching to the settings route
              async loader({ params }) {
                console.log({ params })
                // FIXME: Should prob not include all this information
                utils.user.myAccounts.fetch()
                return {}
                // accounts: await utils.account.all.fetch()
              }
            }
          ]
        }
      ]}>
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
