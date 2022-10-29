import {
  ReactLocationOptions,
  Route,
  createMemoryHistory
} from "@tanstack/react-location"

import { Calendar } from "~features/calendar"
import type { trpc } from "~trpc"

import { SignIn } from "./auth"
import Settings from "./settings"

// Create a memory history
export const reactLocationOptions: ReactLocationOptions = {
  history: createMemoryHistory({
    initialEntries: ["/authenticated"] // Pass your initial url
  })
}

interface Params {
  utils: ReturnType<typeof trpc.useContext>
  // authentication: ReturnType<typeof ChromeStorage.accessToken.safeParse>
}
// FIXME: no-unused var on params in type declaration
// eslint-disable-next-line
export const getRoutes: (params: Params) => Route[] = ({
  utils
  // authentication
}) => {
  return [
    {
      path: "authenticated/",
      element: <SignIn />,
      children: [
        {
          path: "/",
          loader: async () => {
            const user = await utils.user.current.fetch()
            const events = await utils.post.all.fetch()
            return { user, events }
          },
          element: <Calendar />
        },
        {
          path: "settings",
          element: <Settings />
          // TODO: add account fetching to the settings route
          // loader: async ({ params }) => {
          //   console.log({ params })
          //   // accounts: await utils.account.all.fetch()
          // }
        }
      ]
    }
  ]
}
