import type { Language } from "@prisma/client";

export interface LanguageFormatItem {
  key: Language;
  icon: string;
  title: string;
  defaultIntroSentence: string;
}
