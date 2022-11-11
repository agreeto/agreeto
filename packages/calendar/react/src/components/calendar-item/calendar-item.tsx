// This import is required for @fullcalendar with Vite
// For the issue check: https://github.com/fullcalendar/fullcalendar-react/issues/150#issuecomment-909551007
import "@fullcalendar/react/dist/vdom";
import interactionPlugin from "@fullcalendar/interaction";
import type {
  DateSelectArg,
  DayHeaderContentArg,
  EventApi,
  EventClickArg,
  EventContentArg,
  EventInput,
  SlotLabelContentArg,
} from "@fullcalendar/react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import momentTimezonePlugin from "@fullcalendar/moment-timezone";
import { add, differenceInMinutes } from "date-fns";
import { getTimezoneOffset } from "date-fns-tz";
import "./calendar-item.scss";
import type { FC } from "react";
import { useEffect, useRef } from "react";
import { EventResponseStatus } from "@agreeto/calendar-core";
import { eventMocks } from "./mock";
import { ulid } from "ulid";
import {
  getDateLocale,
  getHourText,
  getPrimaryTimeZone,
} from "@agreeto/calendar-core";
import TimeZoneSelect from "./time-zone-select";

import { trpc } from "../../utils/trpc";
import { type RouterOutputs } from "@agreeto/api";
import { useStore } from "../../utils/store";

type EventGroupEvent = RouterOutputs["eventGroup"]["byId"]["events"][number];
type Event = RouterOutputs["event"]["all"][number];

type Props = {
  referenceDate: Date;
  events?: Event[];
  weekends: boolean;
  title: string;
  selectedSlots: EventInput[];
  onEventClick?: (event: EventClickArg) => void;
  onRefSettled: (ref: any) => void;
  onSelect: (slot: EventInput) => void;
  onSelectedSlotDelete: (slot: EventInput) => void;
  onSlotUpdate: (slot: EventInput) => void;
  hoveredEvent?: EventGroupEvent;
  directoryUsersWithEvents: RouterOutputs["event"]["directoryUsers"];
  selectedEventGroupId?: string;
  onPageChange?: (page: string) => void;
};

const CalendarItem: FC<Props> = ({
  referenceDate,
  events,
  weekends,
  selectedSlots,
  title,
  onEventClick,
  onRefSettled,
  onSelect,
  onSelectedSlotDelete,
  onSlotUpdate,
  hoveredEvent,
  directoryUsersWithEvents,
  selectedEventGroupId,
  onPageChange,
}) => {
  const ref = useRef<any>(null);
  const enableMock = false;

  // Redux
  const timeZones = useStore((s) => s.timeZones);
  const primaryTimeZone = getPrimaryTimeZone(timeZones);

  const { data: currentUser } = trpc.user.me.useQuery();
  const { data: preference } = trpc.preference.byCurrentUser.useQuery();
  const locale = getDateLocale(preference);

  useEffect(() => {
    if (ref) onRefSettled(ref);
  }, [ref]);

  const extractEventHours = (event: EventApi) => {
    if (event.start && event.end) {
      return `${getHourText(event.start, {
        locale,
        timeZone: primaryTimeZone,
      })} - ${getHourText(event.end, {
        locale,
        timeZone: primaryTimeZone,
      })}`;
    }
    return null;
  };

  const renderCalendarHeader = ({ date, isToday }: DayHeaderContentArg) => {
    const day = date.toLocaleDateString(undefined, {
      weekday: "short",
    });

    return (
      <div>
        <div className="color-gray-600 font-normal">{day}</div>
        <div
          className={`my-1 flex h-10 w-10 items-center justify-center rounded-full text-xl font-semibold ${
            isToday ? "bg-primary text-white" : "color-gray-600"
          }`}
        >
          {date.getDate()}
        </div>
      </div>
    );
  };

  const renderCalendarEvent = ({ event }: EventContentArg) => {
    const { start, end, extendedProps } = event;
    let shrinkFont = false;
    let diff = 1000;
    if (start && end) {
      diff = differenceInMinutes(end, start);
      if (diff <= 45) shrinkFont = true;
    }

    return (
      <div
        className={`h-full overflow-hidden ${
          extendedProps?.isDeclined ? "line-through" : ""
        } ${shrinkFont ? "" : "p-1"} ${diff <= 15 ? "flex space-x-1" : ""}`}
        style={{
          color: event.textColor,
          lineHeight: shrinkFont ? 1 : undefined,
        }}
        title={`${event.title} 
        
${extractEventHours(event)}`} // This is not a lint error. The space is left here on purpose for line breaks in the title
      >
        {/* Title */}
        <div className={`${shrinkFont ? "text-2xs" : "text-xs"} font-semibold`}>
          {event.title}
        </div>
        {/* Event hours */}
        <div className="text-3xs-05">{extractEventHours(event)}</div>
        {/* Cancel button */}
        {extendedProps?.new && (
          <div
            className={
              "text-3xs-05 bg-event-block absolute flex h-4 w-4 cursor-pointer items-center justify-center rounded-full text-white"
            }
            style={{
              top: extendedProps?.new ? "-10px" : "-8px",
              right: extendedProps?.new ? "-8px" : "-6px",
            }}
            onClick={() => {
              onSelectedSlotDelete(event.toJSON());
            }}
          >
            X
          </div>
        )}
      </div>
    );
  };

  const renderSlotLabels = ({ time }: SlotLabelContentArg) => {
    return (
      <div
        className={`text-ceter color-gray-300 flex text-xs ${
          timeZones.length === 1
            ? "w-14 justify-center"
            : "w-24 justify-between pr-2"
        }`}
        style={{
          lineHeight: "12px", // This is for slot height. Update this and fc-timegrid-slot in calendar-item.scss to chage the height
        }}
      >
        {timeZones.map((tz, idx) => {
          let date = new Date(referenceDate);
          // If it is Sunday, add 1 day to get the correct week for day light saving
          if (date.getDay() === 0) {
            date = add(date, { days: 1 });
          }
          const pivotOffset = getTimezoneOffset(primaryTimeZone, date);
          const offset = getTimezoneOffset(tz, date);
          const millis = time.milliseconds - pivotOffset + offset;
          const hour = (millis / (60 * 60 * 1000) + 24) % 24;

          // Decide text
          let text = "";
          if (hour === 0) {
            text = "12 am";
          } else if (hour < 12) {
            text = `${hour} am`;
          } else if (hour === 12) {
            text = "12 pm";
          } else {
            text = `${hour - 12} pm`;
          }

          return (
            <div key={`${tz}-${idx}`} style={{ width: "34px" }}>
              {text}
            </div>
          );
        })}
      </div>
    );
  };

  const getEvents = (): EventInput[] => {
    if (enableMock) return [...eventMocks, ...selectedSlots];
    if (!events) return [];

    const newEvents: EventInput[] = [];

    // Add own events
    events.forEach((event) => {
      const { id, title, startDate, endDate, account, attendees } = event;

      const backgroundColor = account?.color.color;
      const textColor = account?.color.darkColor;

      const isDeclined = attendees?.some(
        (a) =>
          a.email === currentUser?.email &&
          a.responseStatus === EventResponseStatus.DECLINED,
      );

      newEvents.push({
        id,
        title: title,
        start: startDate,
        end: endDate,
        backgroundColor: isDeclined ? "white" : backgroundColor,
        textColor: textColor,
        borderColor: isDeclined ? textColor : "transparent",
        extendedProps: {
          isDeclined,
          event,
          ...event,
        },
      });
    });

    // Add events of directory users
    directoryUsersWithEvents.forEach(({ events: directoryEvents }) => {
      directoryEvents?.forEach((event) => {
        const { id, title, startDate, endDate } = event;

        newEvents.push({
          id,
          title: title,
          start: startDate,
          end: endDate,
          // FIXME: Color
          backgroundColor: "cyan", // color,
          textColor: "white",
          borderColor: "transparent",
          extendedProps: {
            ...event,
          },
        });
      });
    });

    return [...newEvents, ...selectedSlots];
  };

  const handleSelect = ({ start, end }: DateSelectArg) => {
    const slot: EventInput = {
      id: ulid(),
      start,
      end,
      title,
      backgroundColor: "white",
      textColor: "#0D47A1",
      borderColor: "#0D47A1",
      editable: true,
      durationEditable: true,
      extendedProps: {
        new: true,
      },
    };
    onSelect(slot);
    ref.current.getApi().unselect();
  };

  return (
    <div className="relative w-full">
      <FullCalendar
        plugins={[interactionPlugin, timeGridPlugin, momentTimezonePlugin]}
        initialView="timeGridWeek"
        ref={ref}
        dayHeaderContent={renderCalendarHeader}
        eventContent={renderCalendarEvent}
        selectable
        select={handleSelect}
        events={getEvents()}
        headerToolbar={false}
        weekends={weekends}
        eventClick={onEventClick}
        slotLabelInterval={{ hours: 1 }}
        slotDuration="00:15:00"
        height={600}
        allDaySlot={false}
        slotLabelContent={renderSlotLabels}
        eventChange={({ event }) => onSlotUpdate(event.toJSON())}
        scrollTime="08:00:00"
        nowIndicator
        timeZone={primaryTimeZone}
        eventOrder={(e1: any, e2: any) => {
          if (e1?.extendedProps?.new) {
            return 1;
          }
          if (e2?.extendedProps?.new) {
            return -1;
          }
          return 1;
        }}
        eventDidMount={({ el, event }) => {
          el.style.width = "calc(100% - 10px)";
          if (hoveredEvent?.id === event.id) {
            el.style.borderStyle = "dashed";
            el.style.borderColor = "#E57373";
            el.style.borderWidth = "3px";
          } else if (
            selectedEventGroupId &&
            selectedEventGroupId === event.extendedProps.eventGroupId
          ) {
            el.style.borderStyle = "dashed";
            el.style.borderColor = "#E57373";
            el.style.borderWidth = "1px";
            el.style.cursor = "pointer";
          } else if (event.extendedProps?.new) {
            el.style.borderStyle = "dashed";
            el.style.borderWidth = "2px";
          } else if (event.extendedProps?.isAgreeToEvent) {
            el.style.borderStyle = "hidden";
            el.style.cursor = "pointer";
          } else {
            el.style.cursor = "not-allowed";
          }
        }}
      />

      {/* Timezone title */}
      <div
        className="absolute top-7 flex justify-around"
        style={{
          width: timeZones.length === 1 ? "64px" : "120px",
          left: timeZones.length === 1 ? "-14px" : "-8px",
          paddingRight: timeZones.length === 1 ? "0" : "8px",
        }}
      >
        {/* Plus icon */}
        {timeZones.length === 1 && (
          <TimeZoneSelect
            onPageChange={onPageChange}
            index={1}
            value=""
            type="addIcon"
          />
        )}
        {/* Time zones */}
        {timeZones.map((tz, idx) => (
          <TimeZoneSelect
            key={`${tz}-${idx}`}
            index={idx}
            value={tz}
            type={timeZones.length > 1 && idx === 0 ? "secondary" : "primary"}
            referenceDate={
              referenceDate.getDay() === 0
                ? add(referenceDate, { days: 1 })
                : referenceDate
            }
          />
        ))}
      </div>
    </div>
  );
};

export default CalendarItem;
