import "./globals.css";
import "@agreeto/ui/dist/styles.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { TRPCProvider } from "./features/trpc/provider";

import { App } from "./features/app/app";
import { Button } from "@agreeto/ui";

if (Office !== undefined) {
  Office.onReady(() => {
    ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
      <React.StrictMode>
        <TRPCProvider>
          <App />
          <Button variant="warning" onClick={() => console.log("Boop")}>
            Boooooop
          </Button>
        </TRPCProvider>
      </React.StrictMode>,
    );
  });
}
