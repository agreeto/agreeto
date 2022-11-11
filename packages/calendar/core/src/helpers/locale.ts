import { Language } from "../types";
import { de, enUS, es, fr, it } from "date-fns/locale";
import { type Locale } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { type RouterOutputs } from "@agreeto/api";

interface DateFnsTzOptions {
  timeZone: string;
  locale?: Locale;
}

export const getCopyTitle = (
  preference?: RouterOutputs["preference"]["byCurrentUser"],
) => {
  switch (preference?.formatLanguage) {
    case Language.DE:
      return "Ich bin zu folgenden Zeiten verfügbar:";
    case Language.FR:
      return "Je serai disponible aux horaires suivants :";
    case Language.IT:
      return "Sarò disponibile nei seguenti orari:";
    case Language.ES:
      return "Estaré disponible en los siguientes horarios:";
    default:
      return "Would any of the following times work for you?";
  }
};

export const getHourText = (
  date: Date,
  { timeZone = "UTC", locale }: DateFnsTzOptions,
) => {
  switch (locale) {
    case enUS:
      return formatInTimeZone(date, timeZone, "hh:mmaaa", { locale });
    default:
      return formatInTimeZone(date, timeZone, "HH:mm", { locale });
  }
};

export const getDateLocale = (
  preference?: RouterOutputs["preference"]["byCurrentUser"],
) => {
  switch (preference?.formatLanguage) {
    case Language.DE:
      return de;
    case Language.FR:
      return fr;
    case Language.IT:
      return it;
    case Language.ES:
      return es;
    default:
      return enUS;
  }
};
