import { format } from "date-fns-tz";
import { enUS } from "date-fns/locale";

export const getPrimaryTimeZone = (timeZones: string[]) => {
  return timeZones[1] ?? timeZones[0] ?? "UTC";
};

export const getTimeZoneAbv = (timeZone: string, date = new Date()) => {
  const title = format(date, "zzz", { timeZone });

  const convertedTimeZones = ["GMT-4", "GMT-5", "GMT-6", "GMT-7", "GMT-8"];
  if (convertedTimeZones.includes(title)) {
    // Forcefully use enUS locale
    return format(date, "zzz", { timeZone, locale: enUS });
  }

  return title;
};
