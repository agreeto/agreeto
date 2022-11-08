import { EventResponseStatus } from "@agreeto/db";
import { z } from "zod";

export const AttendeeValidator = z.object({
  id: z.string().cuid(),
  email: z.string(),
  name: z.string(),
  surname: z.string(),
  provider: z.string(),
  responseStatus: z.nativeEnum(EventResponseStatus),
  eventId: z.string().optional(),
});
