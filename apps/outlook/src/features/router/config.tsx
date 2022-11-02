import { type Route } from "@tanstack/react-location";

import { Home } from "../../pages/home";
import { Settings } from "../../pages/settings";
import { Taskpane } from "../../pages/taskpane";

export const getRoutes: () => Route[] = () => {
  // const utils = trpc.useContext();
  return [
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "taskpane",
      element: <Taskpane />,
    },
    {
      path: "settings",
      element: <Settings />,
    },
  ];
};
