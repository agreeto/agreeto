import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { AuthButton } from "~features/auth"

import App from "./app"

export const queryClient = new QueryClient()

function IndexPopup() {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  )
}

export default IndexPopup
