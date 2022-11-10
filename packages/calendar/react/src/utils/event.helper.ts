import { type EventInput } from "@fullcalendar/react";
import copy from "copy-to-clipboard";
import { format } from "date-fns-tz";
import { type Preference } from "@agreeto/db";
import { store } from "../redux/store";
import { convertToDate } from "./date.helper";
import { getCopyTitle, getDateLocale, getHourText } from "./locale.helper";
import { getTimeZoneAbv } from "./time-zone.helper";
import { type RouterOutputs } from "./trpc";

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
        convertToDate(a.start).getTime() - convertToDate(b.start).getTime()
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
  preference?: Preference
) => {
  let text = getCopyTitle(preference);
  const locale = getDateLocale(preference);
  const reduxState = store.getState();
  const timeZone = reduxState.timeZone.selectedTimeZone;

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
