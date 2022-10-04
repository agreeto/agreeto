import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import App from "./app"

export const queryClient = new QueryClient()

function IndexPopup() {
  return (
    <QueryClientProvider client={queryClient}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: 16,
          width: 780,
          height: 600
        }}>
        <h1>Is this big enough for our calendar?</h1>
        <p>This would even work in a new tab</p>
        <p>
          Have seen this quite a bit when people wanted to open a new tab and
          use our ext
        </p>
      </div>
      <App />
    </QueryClientProvider>
  )
}

export default IndexPopup
