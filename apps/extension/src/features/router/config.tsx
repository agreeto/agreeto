import Calendar from "@agreeto/calendar-react";
import {
  createMemoryHistory,
  createReactRouter,
  createRouteConfig,
} from "@tanstack/react-router";

import { SettingsLayout } from "~pages/settings/layout";
import { SettingsPage } from "~pages/settings/settings";
import { Subscription } from "~pages/settings/subscription";

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
      path: "/",
      component: () => <>Select action pane</>,
    }),
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
