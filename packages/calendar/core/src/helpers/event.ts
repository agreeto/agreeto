import { type EventInput } from "@fullcalendar/react";
import copy from "copy-to-clipboard";
import { format } from "date-fns-tz";
import { tzStore } from "../store";
import { convertToDate } from "./date";
import { getCopyTitle, getDateLocale, getHourText } from "./locale";
import { getTimeZoneAbv } from "./timezone";
import { type RouterOutputs } from "@agreeto/api";
import { DateFormat, Language } from "@agreeto/api/client";

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

interface ExtractTextOptions {
  formatLanguage?: Language | undefined;
  copyTitle?: string;
  dateFormat?: DateFormat;
  highlight?: {
    introSentence?: boolean;
    date?: boolean;
    time?: boolean;
  };
}

export const extractTextFromSlots = (
  selectedSlots: EventInput[],
  {
    formatLanguage = Language.EN,
    dateFormat = DateFormat.MMMM_d_EEEE,
    copyTitle,
    highlight,
  }: ExtractTextOptions = {},
) => {
  const copyTitleText = copyTitle ?? getCopyTitle(formatLanguage);
  let text = `<div class="${
    highlight?.introSentence ? "text-primary" : ""
  }">${copyTitleText}</div>`;
  const locale = getDateLocale(formatLanguage);
  const timeZone = tzStore.getState().selectedTimeZone;

  // Group slots based on days
  const groupedSlots = getGroupedSlots(selectedSlots);
  Object.keys(groupedSlots).forEach((key, idx) => {
    const events: EventInput[] = groupedSlots[key];
    const firstEvent = events[0];
    if (!firstEvent) return;

    if (idx !== 0 || copyTitleText) {
      text += '<div style="padding-top: 12px;" />';
    }

    // Add day
    text += `<div class="${
      highlight?.date ? "text-primary" : ""
    }" style="font-weight: 600;">${format(
      convertToDate(firstEvent.start),
      dateFormat,
      {
        locale,
      },
    )}</div>`;

    events.map(({ start, end }) => {
      text += `<div class="${
        highlight?.time ? "text-primary" : ""
      }" style="padding-top: 2px;">• ${getHourText(convertToDate(start), {
        locale,
        timeZone,
      })} - ${getHourText(convertToDate(end), {
        locale,
        timeZone,
      })} ${getTimeZoneAbv(timeZone, convertToDate(start))}</div>`;
    });
  });

  return text;
};

export const copyToClipboard = (
  selectedSlots: EventInput[],
  options: ExtractTextOptions = {},
) => {
  const text = extractTextFromSlots(selectedSlots, options);
  copy(text, { format: "text/html" });
};
