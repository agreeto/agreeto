import { QueryClientProvider } from "@tanstack/react-query"

import FullCalendar from "@fullcalendar/react"

import dayGridPlugin from "@fullcalendar/daygrid"

import { useStorage } from "@plasmohq/storage/hook"

import { queryClient } from "~react-query"
import { ChromeStorage } from "~storage-schema"

import App from "./popup-app"

import "./style.css"

import type { ReactNode } from "react"

import { SignIn } from "~features/auth"

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
