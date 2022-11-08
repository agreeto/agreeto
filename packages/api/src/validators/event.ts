import { EventCalendarType } from "@agreeto/db";
import { z } from "zod";
import { AttendeeValidator } from "./attendee";

export const EventValidator = z.object({
  id: z.string().cuid(),
  userId: z.string(),
  microsoftId: z.string().optional(),
  eventGroupId: z.string(),
  accountId: z.string(),
  title: z.string(),
  location: z.string().optional(),
  description: z.string().default(""),
  attendees: AttendeeValidator.array(),
  calendarType: z.nativeEnum(EventCalendarType).default("BLOCKER"),
  startDate: z.date(),
  endDate: z.date(),
  isAgreeToEvent: z.boolean().default(true),
  isSelected: z.boolean().default(false),
  hasConferece: z.boolean().default(false),
  deletedAt: z.date().optional(),
});
