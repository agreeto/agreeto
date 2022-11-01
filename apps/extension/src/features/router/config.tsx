import {
  type ReactLocationOptions, // type Route,
  createMemoryHistory
} from "@tanstack/react-location"

// import { SignIn } from "~features/auth"
// import { trpcApi } from "~features/trpc/api/hooks"

// import { Calendar } from "./routes/calendar"
// import { Settings } from "./routes/settings"

// Create a memory history
export const reactLocationOptions: ReactLocationOptions = {
  history: createMemoryHistory({
    initialEntries: ["/calendar"] // Pass your initial url
  })
}

// REVIEW (richard): this is not used anymore?
// export const getRoutes: () => Route[] = () => {
//   const utils = trpcApi.useContext()
//   return [
//     {
//       path: "/",
//       element: <SignIn />,
//       children: [
//         {
//           path: "calendar",
//           // loader: async () => {
//           //   const user = await utils.user.current.fetch()
//           //   const events = await utils.post.all.fetch()
//           //   return { user, events }
//           // },
//           element: <Calendar />
//         },
//         {
//           path: "settings",
//           element: <Settings />,
//           // TODO: add account fetching to the settings route
//           async loader({ params }) {
//             console.log({ params })
//             // FIXME: Should prob not include all this information
//             utils.user.myAccounts.fetch()
//             return {}
//             // accounts: await utils.account.all.fetch()
//           }
//         }
//       ]
//     }
//   ]
// }
