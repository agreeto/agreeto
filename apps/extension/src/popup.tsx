import { QueryClientProvider } from "@tanstack/react-query"

// import FullCalendar, { EventInput } from "@fullcalendar/react"
// // needed for dateClick
// import interactionPlugin from "@fullcalendar/interaction"
// // needed for weekly cal-view
// import timeGridWeek from "@fullcalendar/timegrid"
import { queryClient } from "~react-query"

import App from "./popup-app"

import "@fullcalendar/daygrid/main.css"
import "@fullcalendar/timegrid/main.css"
import "@fullcalendar/common/main.css"
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
