import {
  DateFormat,
  IntroSentenceType,
  Language,
} from "@agreeto/db/client-types";
import { z } from "zod";

// Abstraction so that packages don't have to add `@agreeo/db` as a dependency just for these types
export * from "@agreeto/db/client-types";

/** Validators used both on server and client goes in a shared export that's client-friendly */
export const UpdateFormSchema = z.object({
  language: z.nativeEnum(Language),
  dateFormat: z.nativeEnum(DateFormat),
  introSentenceType: z.nativeEnum(IntroSentenceType),
  introSentence: z.string(),
});
