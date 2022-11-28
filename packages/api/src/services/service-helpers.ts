import { type Account } from "@agreeto/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
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

// TODO: this can be validated based on the schema so move to zod
/**
 * A function that checks if the account is a Google Workspace account.
 * - provider has to be Google
 * - email has to be set
 * - email must not end with @gmail.com or @googlemail.com
 * @param account The NextAuth Account object
 * @returns true if the account is a Google Workspace account
 */
export const isGoogleWorkspaceAccount = (account: Account) => {
  // if account is not google, skip
  if (account.provider !== "google") return false;
  // if no email is set for this account, skip
  if (!account.email) return false;
  // if account is not a workspace accoount, skip
  if (/gmail.com|googlemail.com/.test(account.email)) return false;
  // ✅ workspace account
  return true;
};

/**
 * A zod schema for calendar events of co-workers
 */
export const DirectoryUserEventSchema = z.object({
  // do we need this piece of information? I feel like we can remove?
  // agreetoEventId: z.string().optional(),
  // this is different
  providerEventId: z.string(),
  // this is different from the agreeto db model as directUser events don't have an eventGroup
  // TODO: remove from this schema
  // eventGroupId: z.string(),
  // this is different from the agreeto db model as directoryUser events don't have an accountId
  // TODO: remove from this schema
  // accountId: z.string().optional(),
  // optional as per Google Calendar api schema
  title: z.string(),
  description: z.string(),
  startDate: z.date(),
  endDate: z.date(),
});
