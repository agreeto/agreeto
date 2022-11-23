import Calendar from "@agreeto/calendar-react";
import {
  createMemoryHistory,
  createReactRouter,
  createRouteConfig,
} from "@tanstack/react-router";

// import { trpcApi } from "~features/trpc/api/hooks";
import { Settings } from "~pages/settings";
import { Subscription } from "~pages/settings/subscription";

// Create a memory history
export const reactLocationOptions = {
  history: createMemoryHistory({
    initialEntries: ["/calendar"], // Pass your initial url
  }),
};

const routeConfig = createRouteConfig().createChildren((createRoute) => [
  createRoute({
    path: "calendar",
    component: Calendar,
  }),
  createRoute({
    path: "settings",
    component: Settings,
  }).createChildren((createRoute) => [
    createRoute({
      path: "subscription",
      component: Subscription,
    }),
    createRoute({
      path: "settings",
      component: () => <div>Settings</div>,
    }),
  ]),
]);

export const router = createReactRouter({
  routeConfig,
  history: createMemoryHistory({
    initialEntries: ["/calendar"], // Pass your initial url
  }),
});

declare module "@tanstack/react-router" {
  interface RegisterRouter {
    router: typeof router;
  }
}
