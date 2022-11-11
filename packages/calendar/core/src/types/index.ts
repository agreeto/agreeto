// Enums copied from @prisma/client so we can use them on the client
export const EventCalendarType = {
  BLOCKER: "BLOCKER",
} as const;

export type EventCalendarType =
  typeof EventCalendarType[keyof typeof EventCalendarType];

export const EventResponseStatus = {
  ACCEPTED: "ACCEPTED",
  DECLINED: "DECLINED",
  NEEDS_ACTION: "NEEDS_ACTION",
  TENTATIVE: "TENTATIVE",
} as const;

export type EventResponseStatus =
  typeof EventResponseStatus[keyof typeof EventResponseStatus];

export const Language = {
  EN: "EN",
  DE: "DE",
  IT: "IT",
  FR: "FR",
  ES: "ES",
} as const;

export type Language = typeof Language[keyof typeof Language];

export const Membership = {
  FREE: "FREE",
  TRIAL: "TRIAL",
  PRO: "PRO",
  PREMIUM: "PREMIUM",
} as const;

export type Membership = typeof Membership[keyof typeof Membership];

export type Maybe<TType> = TType | null | undefined;
