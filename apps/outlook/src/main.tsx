import "./globals.css";

import {
  createMemoryHistory,
  Link,
  Outlet,
  ReactLocation,
  Router,
} from "@tanstack/react-location";
import React from "react";
import ReactDOM from "react-dom/client";
import { TRPCProvider } from "./features/trpc/provider";

import { getRoutes } from "./features/router/config";

const location = new ReactLocation({
  history: createMemoryHistory({
    initialEntries: ["/"], // Pass your initial url
  }),
});

if (Office !== undefined) {
  Office.onReady(() => {
    ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
      <React.StrictMode>
        <TRPCProvider>
          <Router routes={getRoutes()} location={location}>
            <div className="space-x-2 underline">
              <Link to="/">Home</Link>
              <Link to="taskpane">Taskpane</Link>
              <Link to="settings">Settings</Link>
            </div>
            <Outlet />
          </Router>
        </TRPCProvider>
      </React.StrictMode>
    );
  });
}
