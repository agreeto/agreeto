// TODO: replace w/ Tab from radixui
import { Tab } from "@headlessui/react"
import { Switch } from "@headlessui/react"
import {
  AtSymbolIcon,
  CodeBracketIcon,
  LinkIcon
} from "@heroicons/react/20/solid"
import add from "date-fns/add"
import { FC, useState } from "react"
// import { CgCalendarNext } from "react-icons/cg"
import { z } from "zod"

import FullCalendar, { EventInput } from "@fullcalendar/react"

// needed for dateClick
import interactionPlugin from "@fullcalendar/interaction"
// needed for weekly cal-view
import timeGridWeek from "@fullcalendar/timegrid"

export const Calendar: FC = () => {
  const [createdSlots, setCreatedSlots] = useState<EventInput[]>()
  // state for clicked events goes here
  return (
    <div id="app" className="flex">
      <main
        id="content-column"
        role="main"
        className="flex-grow w-full h-full p-3 overflow-auto">
        <FullCalendar
          plugins={[timeGridWeek, interactionPlugin]}
          initialView="timeGridWeek"
          aspectRatio={1.1}
          weekends={false}
          events={createdSlots}
          dateClick={(event) => {
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
                <div className="flex items-center ml-auto space-x-5">
                  <div className="flex items-center">
                    <button
                      type="button"
                      className="-m-2.5 inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-400 hover:text-gray-500">
                      <span className="sr-only">Insert link</span>
                      <LinkIcon className="w-5 h-5" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="flex items-center">
                    <button
                      type="button"
                      className="-m-2.5 inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-400 hover:text-gray-500">
                      <span className="sr-only">Insert code</span>
                      <CodeBracketIcon className="w-5 h-5" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="flex items-center">
                    <button
                      type="button"
                      className="-m-2.5 inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-400 hover:text-gray-500">
                      <span className="sr-only">Mention someone</span>
                      <AtSymbolIcon className="w-5 h-5" aria-hidden="true" />
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
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
    const start = z.date().parse(slot.start)
    const end = z.date().parse(slot.end)

    const startTime = new Intl.DateTimeFormat("de-DE", {
      timeStyle: "short"
    }).format(start)
    const endTime = new Intl.DateTimeFormat("de-DE", {
      timeStyle: "short"
    }).format(end)

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
                  <div className="px-3 pt-2 pb-12 mx-px mt-px text-sm leading-5 text-gray-800">
                    Preview content will render here.
                  </div>
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </>
        )}
      </Tab.Group>
      <div className="mt-2">
        <Toggle slots={slots} />
      </div>

      <div className="mt-2">
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          Save
        </button>
      </div>
    </form>
  )
}

const Toggle = ({ slots }: { slots: EventInput[] | undefined }) => {
  const [enabled, setEnabled] = useState(false)
  return (
    <Switch.Group as="div" className="flex items-center justify-between">
      <span className="flex flex-col flex-grow">
        <Switch.Label
          as="span"
          className="text-sm font-medium text-gray-900"
          passive>
          Create booking link
        </Switch.Label>
        <Switch.Description as="span" className="text-sm text-gray-500">
          Reduces back-and-forth.
        </Switch.Description>
      </span>
      <Switch
        checked={enabled}
        onChange={() => {
          if (!enabled) {
            window.open(
              `https://calendar.google.com/calendar/u/0/r/appointment?${new URLSearchParams(
                [["ref", "agreeto"], ...getSlotsAsParams(slots)]
              )}`,
              "_blank"
            )
          }
          setEnabled((prev) => !prev)
        }}
        className={classNames(
          enabled ? "bg-indigo-600" : "bg-gray-200",
          "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        )}>
        <span
          aria-hidden="true"
          className={classNames(
            enabled ? "translate-x-5" : "translate-x-0",
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
          )}
        />
      </Switch>
    </Switch.Group>
  )
}

const getSlotsAsParams = (slots: Array<EventInput> | undefined) => {
  // parse
  const slotsParsed = z
    .array(z.object({ start: z.date(), end: z.date() }))
    .parse(slots)
  // flatten
  return slotsParsed.flatMap((slot, ix) => {
    return [
      [`slot-${ix}-start`, slot.start.toLocaleString()],
      [`slot-${ix}-end`, slot.end.toLocaleString()]
    ]
  })
}
