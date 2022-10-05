import add from "date-fns/add"
import { ReactNode, useState } from "react"

import FullCalendar, { EventInput } from "@fullcalendar/react"

// needed for dateClick
import interactionPlugin from "@fullcalendar/interaction"
// needed for weekly cal-view
import timeGridWeek from "@fullcalendar/timegrid"

export const Calendar: React.FC<{ children?: ReactNode }> = ({ children }) => {
  const [createdSlots, setCreatedSlots] = useState<EventInput[]>()
  // state for clicked events goes here
  return (
    <div id="app" className="flex">
      <main
        id="content-column"
        role="main"
        className="w-full h-full flex-grow p-3 overflow-auto">
        <FullCalendar
          plugins={[timeGridWeek, interactionPlugin]}
          initialView="timeGridWeek"
          aspectRatio={1.1}
          weekends={false}
          events={createdSlots}
          dateClick={(event) => {
            console.log("date clicked", event.date)
            setCreatedSlots([
              ...(createdSlots !== undefined ? createdSlots : []),
              {
                start: event.date,
                end: add(event.date, { minutes: 30 }),
                date: event.date
              }
            ])
          }}
        />
      </main>
      <div
        id="right-column"
        className="sm:w-1/3 md:1/4 w-full flex-shrink flex-grow-0 p-4">
        {/* <!-- nav goes here --> */}
        sidebar goes here
      </div>
    </div>
  )
}
