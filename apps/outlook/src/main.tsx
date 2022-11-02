import "./globals.css";

import {
  createMemoryHistory,
  Outlet,
  ReactLocation,
  Router,
} from "@tanstack/react-location";
import React from "react";
import ReactDOM from "react-dom/client";
import { TRPCProvider } from "./features/trpc/provider";

import { getRoutes } from "./features/router/config";
import { useIsAuthed } from "./features/auth/is-authed";
import { SignIn } from "./features/auth/sign-in";
import { Layout } from "./layout";

const location = new ReactLocation({
  history: createMemoryHistory({
    initialEntries: ["/"], // Pass your initial url
  }),
});

const App = () => {
  const { isAuthed, isAuthenticating } = useIsAuthed();

  return (
    <Router routes={getRoutes()} location={location}>
      {isAuthenticating ? (
        <div className="h-full w-full grid place-content-center">
          <div className="h-12 w-12 rounded-full border-2 animate-pulse"></div>
        </div>
      ) : isAuthed ? (
        /** THE ACTUAL APP */
        <Layout>
          <Outlet />
        </Layout>
      ) : (
        /** OR: SIGN IN */
        <SignIn />
      )}
    </Router>
  );
};

if (Office !== undefined) {
  Office.onReady(() => {
    ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
      <React.StrictMode>
        <TRPCProvider>
          <App />
        </TRPCProvider>
      </React.StrictMode>
    );
  });
}
