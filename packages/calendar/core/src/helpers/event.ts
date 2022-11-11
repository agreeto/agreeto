import { type EventInput } from "@fullcalendar/react";
import copy from "copy-to-clipboard";
import { format } from "date-fns-tz";
import { store } from "../store";
import { convertToDate } from "./date";
import { getCopyTitle, getDateLocale, getHourText } from "./locale";
import { getTimeZoneAbv } from "./timezone";
import { type RouterOutputs } from "@agreeto/api";

type Event = RouterOutputs["event"]["all"][number];

export const convertToSlot = ({
  id,
  title,
  startDate,
  endDate,
}: Event): EventInput => {
  return {
    id,
    title,
    start: startDate,
    end: endDate,
  };
};

export const getGroupedSlots = (selectedSlots: EventInput[]) => {
  const slots: EventInput = {};
  selectedSlots
    .slice()
    .sort(
      (a, b) =>
        convertToDate(a.start).getTime() - convertToDate(b.start).getTime(),
    )
    .forEach((slot) => {
      const day = format(convertToDate(slot.start), "yyyy-MM-dd");
      if (!slots[day]) {
        slots[day] = [];
      }
      slots[day].push(slot);
    });

  return slots;
};

export const copyToClipboard = (
  selectedSlots: EventInput[],
  preference?: RouterOutputs["preference"]["byCurrentUser"],
) => {
  let text = getCopyTitle(preference);
  const locale = getDateLocale(preference);
  const timeZone = store.getState().selectedTimeZone;

  // Group slots based on days
  const groupedSlots = getGroupedSlots(selectedSlots);
  Object.keys(groupedSlots).forEach((key) => {
    const events: EventInput[] = groupedSlots[key];
    const firstEvent = events[0];
    if (!firstEvent) return;

    // Add day
    text += `\n\n${format(convertToDate(firstEvent.start), "MMMM d (EEEE)", {
      locale,
    })}`;

    events.map(({ start, end }) => {
      text += `\n• ${getHourText(convertToDate(start), {
        locale,
        timeZone,
      })} - ${getHourText(convertToDate(end), {
        locale,
        timeZone,
      })} ${getTimeZoneAbv(timeZone, convertToDate(start))}`;
    });
  });

  copy(text, { format: "text/plain" });
};
