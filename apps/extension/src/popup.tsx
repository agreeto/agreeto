import { QueryClientProvider } from "@tanstack/react-query"

import { queryClient } from "~react-query"

import App from "./app"

import "./style.css"

function IndexPopup() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="w-[800] h-[600]">
        <App />
      </div>
    </QueryClientProvider>
  )
}

export default IndexPopup
