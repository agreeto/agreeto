// import Calendar from "@agreeto/calendar-react";
import {
  createMemoryHistory,
  createReactRouter,
  createRouteConfig,
} from "@tanstack/react-router";

// import { Accounts } from "../../pages/accounts";
// import { SettingsLayout } from "../../pages/settings/layout";
// import { SignoutPage } from "../../pages/settings/signout";
// import { Subscription } from "../../pages/settings/subscription";

const routeConfig = createRouteConfig().createChildren((createRoute) => [
  createRoute({
    path: "calendar",
    component: () => (
      <div>Hii</div>
      // <Calendar onPageChange={(to) => router.navigate({ to: "/" })} />
    ),
  }),
  // createRoute({
  //   path: "settings",
  //   component: SettingsLayout,
  // }).createChildren((createRoute) => [
  //   createRoute({
  //     path: "/",
  //     component: () => <>Select action pane</>,
  //   }),
  //   createRoute({
  //     path: "subscription",
  //     component: Subscription,
  //   }),
  //   createRoute({
  //     path: "signout",
  //     component: SignoutPage,
  //   }),
  // ]),
  // createRoute({
  //   path: "accounts",
  //   component: Accounts,
  // }),
  createRoute({
    path: "format",
    component: () => <>Add Format Here</>,
  }),
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
