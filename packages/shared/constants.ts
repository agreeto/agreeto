import { Language } from "@prisma/client";
import flagDeIcon from "../assets/flag-de.svg";
import flagEsIcon from "../assets/flag-es.svg";
import flagFrIcon from "../assets/flag-fr.svg";
import flagItIcon from "../assets/flag-it.svg";
import flagUSIcon from "../assets/flag-us.svg";
import { type LanguageFormatItem } from "./interfaces";

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
