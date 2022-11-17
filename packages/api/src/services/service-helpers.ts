import { type Account } from "@agreeto/db";
import { TRPCError } from "@trpc/server";
import { GoogleCalendarService } from "./google.calendar";
import { MicrosoftCalendarService } from "./microsoft.calendar";

export const getCalendarService = (account: Account) => {
  switch (account.provider) {
    case "google":
      return new GoogleCalendarService(
        account.access_token,
        account.refresh_token,
      );
    case "azure-ad":
      return new MicrosoftCalendarService(
        account.access_token,
        account.refresh_token,
      );
    default:
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Provider ${account.provider} not supported`,
      });
  }
};
