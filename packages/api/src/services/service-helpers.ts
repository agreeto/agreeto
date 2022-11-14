import { type Account, type Event } from "@agreeto/db";
import { TRPCError } from "@trpc/server";
import { GoogleCalendarService } from "./google.calendar";
import { MicrosoftCalendarService } from "./microsoft.calendar";

export const getCalendarService = (account: Account, event?: Event) => {
  switch (account.provider) {
    case "google":
      return {
        service: new GoogleCalendarService(
          account.access_token,
          account.refresh_token,
        ),
        eventId: event?.id,
      };
    case "azure-ad":
      return {
        service: new MicrosoftCalendarService(
          account.access_token,
          account.refresh_token,
        ),
        eventId: event?.microsoftId ?? undefined,
      };
    default:
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Provider ${account.provider} not supported`,
      });
  }
};

/**
 * These two are used when we query the google calendar API since it screams
 * when there are `-` in the query string.
 * - When we query google we remove the `-` and replace them with ``
 * - When we get events from google we add the `-` back (if event is an AgreeTo event)
 */
export const removeDashSeparator = (id: string) => id.replace(/-/g, "");
export const addDashSeparator = (id: string, isAgreeTo: boolean) => {
  if (!isAgreeTo) return id;
  return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(
    16,
    20,
  )}-${id.slice(20)}`;
};
