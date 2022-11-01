import { type Route } from "@tanstack/react-location";

import { Home } from "./routes/home";
import { Taskpane } from "./routes/taskpane";

export const getRoutes: () => Route[] = () => {
  // const utils = trpc.useContext();
  return [
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/taskpane",
      element: <Taskpane />,
    },
  ];
};
