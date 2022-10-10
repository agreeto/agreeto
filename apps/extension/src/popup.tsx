import { QueryClientProvider } from "@tanstack/react-query"

import { queryClient } from "~react-query"

import App from "./popup-app"

// note (richard): import order is important to not run into specificity issues
import "@fullcalendar/common/main.css"
import "@fullcalendar/daygrid/main.css"
import "@fullcalendar/timegrid/main.css"
import "./style.css"

function IndexPopup() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* maximum size of popup */}
      <div className="w-[800] h-[600]">
        <App />
      </div>
    </QueryClientProvider>
  )
}

export default IndexPopup
