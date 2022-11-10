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
      <div
        style={{
          margin: "40px",
          borderRadius: "10px",
          boxShadow: "0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)",
        }}
      >
        <Calendar />
      </div>
    </TRPCProvider>
  </React.StrictMode>
);
