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
          account.refresh_token
        ),
        eventId: event?.id,
      };
    case "azure-ad":
      return {
        service: new MicrosoftCalendarService(
          account.access_token,
          account.refresh_token
        ),
        eventId: event?.microsoftId,
      };
    default:
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Provider ${account.provider} not supported`,
      });
  }
};
