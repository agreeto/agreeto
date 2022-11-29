/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Language } from "@prisma/client";
// @ts-ignore
import flagDeIcon from "@agreeto/ui/src/assets/flag-de.svg";
// @ts-ignore
import flagEsIcon from "@agreeto/ui/src/assets/flag-es.svg";
// @ts-ignore
import flagFrIcon from "@agreeto/ui/src/assets/flag-fr.svg";
// @ts-ignore
import flagItIcon from "@agreeto/ui/src/assets/flag-it.svg";
// @ts-ignore
import flagUSIcon from "@agreeto/ui/src/assets/flag-us.svg";
import { type LanguageFormatItem } from "./interfaces";

// FIXME:
export const API_URL = "https://localhost:3000";

export const LOCAL_STORAGE_KEYS = {
  TIME_ZONES: "timeZones",
  SELECTED_TIME_ZONE: "selectedTimeZone",
  PRIMARY_TIME_ZONE: "primaryTimeZone",
  RECENTLY_USED_TIME_ZONES: "recentlyUsedTimeZones",
  PRIMARY_ACTION_BUTTON_TYPE: "primaryActionButtonType",
};

export type PLATFORM = "ext" | "web" | "addin";

export const LANGUAGE_FORMATS: LanguageFormatItem[] = [
  {
    key: Language.EN,
    icon: flagUSIcon,
    title: "English (US)",
    defaultIntroSentence: "Would any of the following times work for you?",
  },
  {
    key: Language.ES,
    icon: flagEsIcon,
    title: "Spanish (ES)",
    defaultIntroSentence: "Estaré disponible en los siguientes horarios:",
  },
  {
    key: Language.DE,
    icon: flagDeIcon,
    title: "German (DE)",
    defaultIntroSentence: "Ich bin zu folgenden Zeiten verfügbar:",
  },
  {
    key: Language.FR,
    icon: flagFrIcon,
    title: "French (FR)",
    defaultIntroSentence: "Je serai disponible aux horaires suivants :",
  },
  {
    key: Language.IT,
    icon: flagItIcon,
    title: "Italian (IT)",
    defaultIntroSentence: "Sarò disponibile nei seguenti orari:",
  },
];

export const DEFAULT_LANGUAGE_FORMAT = LANGUAGE_FORMATS[0];

export const DATE_FORMAT = {
  MMMM_d_EEEE: "MMMM d (EEEE)",
  MM_dd_yyyy: "MM/dd/yyyy",
  yyyy_MM_dd: "yyyy/MM/dd",
  MMMM_dd_yyyy: "MMMM dd, yyyy",
  EEEE_MM_dd_yyyy: "EEEE, MM/dd/yyyy",
  MMM_dd_EEEE: "MMM dd (EEEE)",
  EEEE_M_d: "EEEE, M/d",
  EEE_MM_dd: "EEE, MM/dd",
};
