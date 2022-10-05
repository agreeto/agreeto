import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import App from "./app"

import "./style.css"

function IndexPopup() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="w-[800] h-[600]">
      <App />
    </QueryClientProvider>
  )
}

export default IndexPopup
