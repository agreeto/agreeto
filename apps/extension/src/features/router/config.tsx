import Calendar from "@agreeto/calendar-react";
import {
  type ReactLocationOptions,
  type Route,
  createMemoryHistory,
} from "@tanstack/react-location";

import { SignIn } from "~features/auth";
import { trpcApi } from "~features/trpc/api/hooks";
import { Settings } from "~pages/settings";

// Create a memory history
export const reactLocationOptions: ReactLocationOptions = {
  history: createMemoryHistory({
    initialEntries: ["/calendar"], // Pass your initial url
  }),
};

// REVIEW (richard): this is not used anymore?
export const getRoutes: () => Route[] = () => {
  const utils = trpcApi.useContext();
  return [
    {
      path: "/",
      element: <SignIn />,
      children: [
        {
          path: "calendar",
          element: <Calendar />,
        },
        {
          path: "settings",
          element: <Settings />,
          // TODO: add account fetching to the settings route
          async loader({ params }) {
            console.log({ params });
            // FIXME: Should prob not include all this information
            utils.account.me.fetch();
            return {};
            // accounts: await utils.account.all.fetch()
          },
        },
      ],
    },
  ];
};
