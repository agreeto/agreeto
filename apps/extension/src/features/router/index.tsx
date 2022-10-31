import {
  type ReactLocationOptions,
  type Route,
  createMemoryHistory
} from "@tanstack/react-location"

import { SignIn } from "~features/auth"
import { Calendar } from "~features/calendar"
import { trpcApi } from "~features/trpc/api"

import { Settings } from "./routes/settings"

// Create a memory history
export const reactLocationOptions: ReactLocationOptions = {
  history: createMemoryHistory({
    initialEntries: ["/authenticated"] // Pass your initial url
  })
}

export const getRoutes: () => Route[] = () => {
  const utils = trpcApi.useContext()
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
