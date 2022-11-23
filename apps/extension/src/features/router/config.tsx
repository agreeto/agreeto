import Calendar from "@agreeto/calendar-react";
import {
  createMemoryHistory,
  createReactRouter,
  createRouteConfig,
} from "@tanstack/react-router";

// import { trpcApi } from "~features/trpc/api/hooks";
import { SettingsLayout } from "~pages/settings";
import { SettingsPage } from "~pages/settings/settings";
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
    component: SettingsLayout,
  }).createChildren((createRoute) => [
    createRoute({
      path: "subscription",
      component: Subscription,
    }),
    createRoute({
      path: "settings",
      component: SettingsPage,
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
