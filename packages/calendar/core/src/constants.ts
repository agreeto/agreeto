import { Language } from "@agreeto/api/client";
import { DeFlag, EsFlag, FrFlag, ItFlag, UsFlag } from "@agreeto/ui";

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

export type LanguageFormatItem = {
  key: Language;
  icon: typeof UsFlag;
  title: string;
  defaultIntroSentence: string;
};

export const LANGUAGE_FORMATS: LanguageFormatItem[] = [
  {
    key: Language.EN,
    icon: UsFlag,
    title: "English (US)",
    defaultIntroSentence: "Would any of the following times work for you?",
  },
  {
    key: Language.ES,
    icon: EsFlag,
    title: "Spanish (ES)",
    defaultIntroSentence: "Estaré disponible en los siguientes horarios:",
  },
  {
    key: Language.DE,
    icon: DeFlag,
    title: "German (DE)",
    defaultIntroSentence: "Ich bin zu folgenden Zeiten verfügbar:",
  },
  {
    key: Language.FR,
    icon: FrFlag,
    title: "French (FR)",
    defaultIntroSentence: "Je serai disponible aux horaires suivants :",
  },
  {
    key: Language.IT,
    icon: ItFlag,
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
