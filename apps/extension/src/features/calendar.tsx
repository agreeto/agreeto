import type { ReactNode } from "react"

import FullCalendar from "@fullcalendar/react"

import timeGridWeek from "@fullcalendar/timegrid"

export const Calendar: React.FC<{ children?: ReactNode }> = ({ children }) => {
  // state for clicked events goes here
  return (
    // TODO: add radix navbar
    // <Navbar />
    //this is the "main" route; adding more later (e.g. settings) with some sort of router
    <div id="app" className="flex">
      <main
        id="content-column"
        role="main"
        className="w-full h-full flex-grow p-3 overflow-auto">
        <FullCalendar
          plugins={[timeGridWeek]}
          initialView="timeGridWeek"
          aspectRatio={1.1}
          weekends={false}
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
