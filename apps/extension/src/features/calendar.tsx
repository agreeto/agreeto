// TODO: replace w/ Tab from radixui
import { Tab } from "@headlessui/react"
import {
  AtSymbolIcon,
  CodeBracketIcon,
  LinkIcon
} from "@heroicons/react/20/solid"
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
        className="sm:w-1/3 md:1/4 w-full flex-shrink flex-grow-0 p-4 h-[600]">
        {/* <!-- nav goes here --> */}
        <Sidebar slots={createdSlots} />
      </div>
    </div>
  )
}

function classNames(...classes: Array<string>) {
  return classes.filter(Boolean).join(" ")
}

const Sidebar = ({ slots }: { slots: EventInput[] | undefined }) => {
  return (
    <form action="#" className="flex flex-col justify-center h-full">
      <Tab.Group>
        {({ selectedIndex }) => (
          <>
            <Tab.List className="flex items-center">
              <Tab
                className={({ selected }) =>
                  classNames(
                    selected
                      ? "text-gray-900 bg-gray-100 hover:bg-gray-200"
                      : "text-gray-500 hover:text-gray-900 bg-white hover:bg-gray-100",
                    "rounded-md border border-transparent px-3 py-1.5 text-sm font-medium"
                  )
                }>
                CEST
              </Tab>
              <Tab
                className={({ selected }) =>
                  classNames(
                    selected
                      ? "text-gray-900 bg-gray-100 hover:bg-gray-200"
                      : "text-gray-500 hover:text-gray-900 bg-white hover:bg-gray-100",
                    "ml-2 rounded-md border border-transparent px-3 py-1.5 text-sm font-medium"
                  )
                }>
                Eastern
              </Tab>

              {/* These buttons are here simply as examples and don't actually do anything. */}
              {selectedIndex === 0 ? (
                <div className="ml-auto flex items-center space-x-5">
                  <div className="flex items-center">
                    <button
                      type="button"
                      className="-m-2.5 inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-400 hover:text-gray-500">
                      <span className="sr-only">Insert link</span>
                      <LinkIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="flex items-center">
                    <button
                      type="button"
                      className="-m-2.5 inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-400 hover:text-gray-500">
                      <span className="sr-only">Insert code</span>
                      <CodeBracketIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="flex items-center">
                    <button
                      type="button"
                      className="-m-2.5 inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-400 hover:text-gray-500">
                      <span className="sr-only">Mention someone</span>
                      <AtSymbolIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ) : null}
            </Tab.List>
            <Tab.Panels className="mt-2">
              <Tab.Panel className="-m-0.5 rounded-lg p-0.5">
                <label htmlFor="comment" className="sr-only">
                  Comment
                </label>
                <div>
                  <textarea
                    rows={5}
                    name="comment"
                    id="comment"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Click on the calendar to see your slots here..."
                    // TODO: format this properly
                    defaultValue={
                      !slots?.length
                        ? ""
                        : `Would any of the following times work for you?

**${new Intl.DateTimeFormat("de-DE", {
                            weekday: "long",
                            day: "numeric",
                            month: "short",
                            timeZoneName: "long"
                          }).format(new Date(slots[0].start!.toString()))}**
                    
${slots
  ?.map((slot) => {
    if (!slot?.start || !slot?.end) return
    const startDate = new Date(slot.start.toLocaleString())
    const endDate = new Date(slot.end.toLocaleString())
    const startTime = new Intl.DateTimeFormat("de-DE", {
      timeStyle: "short"
    }).format(startDate)
    const endTime = new Intl.DateTimeFormat("de-DE", {
      timeStyle: "short"
    }).format(endDate)

    return `${startTime} - ${endTime}`
  })
  .join(" ")}
                    `
                    }
                  />
                </div>
              </Tab.Panel>
              <Tab.Panel className="-m-0.5 rounded-lg p-0.5">
                <div className="border-b">
                  <div className="mx-px mt-px px-3 pt-2 pb-12 text-sm leading-5 text-gray-800">
                    Preview content will render here.
                  </div>
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </>
        )}
      </Tab.Group>
      <div className="mt-2">
        <button
          type="submit"
          className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          Save
        </button>
      </div>
    </form>
  )
}
