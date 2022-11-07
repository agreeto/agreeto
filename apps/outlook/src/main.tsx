import "./globals.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { TRPCProvider } from "./features/trpc/provider";

import { App } from "./features/app/app";

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
