import React from "react";
import ReactDOM from "react-dom/client";
import Calendar from "./src/calendar";
import "./app.scss";

import { TRPCProvider } from "./src/utils/trpc";

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <TRPCProvider>
      <Calendar />
    </TRPCProvider>
  </React.StrictMode>
);
