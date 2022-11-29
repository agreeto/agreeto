import { type Event, EventResponseStatus, type Attendee } from "@agreeto/db";
import { type ICreateEvent, type IGetEvents, type IUpdateEvent } from "./types";
import { Client } from "@microsoft/microsoft-graph-client";
import * as msal from "@azure/msal-node";
import { type Event as MicrosoftEvent } from "@microsoft/microsoft-graph-types-beta";
import { azureScopes } from "@agreeto/auth";
import { TRPCError } from "@trpc/server";

export type MicrosoftMeetingProviders =
  | "skypeForConsumer"
  | "skypeForBusiness"
  | "teamsForBusiness";

// I am not sure which fields can be changed here. But it works as it is now.
// Read here: https://docs.microsoft.com/en-us/graph/api/singlevaluelegacyextendedproperty-get?view=graph-rest-1.0&tabs=javascript
const EXTENDED_PROP_SEARCH =
  "String {66f5a359-4659-4830-9070-00047ec6ac6e} Name isAgreeToEvent";
const EXTENDED_PROP_ID_SEARCH =
  "String {66f5a359-4659-4830-9070-00047ec6ac6e} Name id";

export class MicrosoftCalendarService {
  // private accessToken: string;
  private refreshToken: string;
  private graphClient: Client;
  private msalClient: msal.ConfidentialClientApplication;

  constructor(_accessToken: string, refreshToken: string) {
    // this.accessToken = accessToken;
    this.refreshToken = refreshToken;

    this.msalClient = new msal.ConfidentialClientApplication({
      auth: {
        clientId: process.env.AZURE_AD_CLIENT_ID as string,
        clientSecret: process.env.AZURE_AD_CLIENT_SECRET as string,
        authority: "https://login.microsoftonline.com/common",
      },
    });

    this.graphClient = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: async () => {
          try {
            const result = await this.msalClient.acquireTokenByRefreshToken({
              refreshToken: this.refreshToken,
              scopes: azureScopes,
            });
            // TODO: Save the refresh token to our DB if it is changed (result.refreshToken)
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return result!.accessToken;
          } catch (cause) {
            console.error(
              "An error occured in Microsoft services (auth)",
              cause,
            );
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Error while refreshing access token",
              cause,
            });
          }
        },
      },
    });
  }

  private toEvent({
    id,
    start,
    end,
    subject,
    body,
    attendees,
    singleValueExtendedProperties,
  }: MicrosoftEvent): Partial<Event & { attendees: Attendee[] }> {
    const extractResponse = (status: string | null | undefined) => {
      return status === "accepted"
        ? EventResponseStatus.ACCEPTED
        : status === "declined"
        ? EventResponseStatus.DECLINED
        : status === "tentativelyAccepted"
        ? EventResponseStatus.TENTATIVE
        : EventResponseStatus.NEEDS_ACTION;
    };

    const isAgreeToEvent = singleValueExtendedProperties?.some(
      (p) => p.id === EXTENDED_PROP_SEARCH && p.value === "true",
    );
    // Get agreeToId from extended props if possible
    const agreeToId = singleValueExtendedProperties?.find(
      (p) => p.id === EXTENDED_PROP_ID_SEARCH,
    )?.value;

    return {
      id: agreeToId ?? id,
      providerEventId: id,
      title: subject || "-",
      description: body?.content || "",
      startDate: new Date(`${start?.dateTime}+00:00`),
      endDate: new Date(`${end?.dateTime}+00:00`),
      isAgreeToEvent,
      attendees: !attendees
        ? []
        : attendees.map((a) => ({
            id: a.emailAddress?.address ?? "",
            color: null,
            eventId: agreeToId ?? (id as string),
            email: a.emailAddress?.address ?? "",
            name: a.emailAddress?.name ?? "",
            surname: "",
            provider: "azure-ad",
            responseStatus: extractResponse(a.status?.response),
          })),
    };
  }

  private toEvents(items: MicrosoftEvent[]) {
    return items.map((item) => this.toEvent(item));
  }

  async getEvents({ startDate, endDate }: IGetEvents) {
    const params: Record<string, string> = {};

    if (startDate)
      params.startDateTime = encodeURIComponent(startDate.toISOString());
    if (endDate) params.endDateTime = encodeURIComponent(endDate.toISOString());

    try {
      // Fetch events
      const response = (await this.graphClient
        .api("/me/calendarview")
        .query(params)
        // .expand(
        //   `singleValueExtendedProperties($filter=(id eq '${EXTENDED_PROP_SEARCH}') or (id eq '${EXTENDED_PROP_ID_SEARCH}'))`,
        // )
        .top(100)
        .get()) as { value?: MicrosoftEvent[] };

      return {
        rawData: response,
        events: this.toEvents(response.value || []),
      };
    } catch (cause) {
      console.error("An error occured in Microsoft services (get)", cause);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "An error occured in Microsoft services",
        cause,
      });
    }
  }

  async createEvent({
    agreeToId,
    title,
    startDate,
    endDate,
    attendeeEmails,
  }: ICreateEvent) {
    const params = {
      subject: title,
      start: {
        dateTime: startDate.toUTCString(),
        timeZone: "UTC",
      },
      end: {
        dateTime: endDate.toUTCString(),
        timeZone: "UTC",
      },
      attendees: attendeeEmails?.map((email) => ({
        emailAddress: { address: email, name: email },
        type: "required",
      })),
      singleValueExtendedProperties: [
        {
          id: EXTENDED_PROP_SEARCH,
          value: "true",
        },
        {
          id: EXTENDED_PROP_ID_SEARCH,
          value: agreeToId,
        },
      ],
    };

    try {
      const response = await this.graphClient
        .api("/me/calendar/events")
        .post(params);

      return {
        rawData: response,
        event: this.toEvent(response),
      };
    } catch (cause) {
      console.error("An error occured in Microsoft services (create)", cause);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "An error occured in Microsoft services",
        cause,
      });
    }
  }

  async updateEvent(
    id: string,
    { hasConference, title, attendeeEmails }: IUpdateEvent,
  ) {
    const params: Record<string, unknown> = {};

    if (attendeeEmails) {
      params.attendees = attendeeEmails.map((email) => ({
        emailAddress: { address: email, name: email },
        status: {
          response: EventResponseStatus.ACCEPTED.toLowerCase(),
        },
        type: "required",
      }));
    }
    if (hasConference) {
      // Not all providers are allowed for each user. So, first we need to fetch the allowed
      // provider for this user.
      const meetingProvider = await this.getAllowedMeetingProvider();
      params.isOnlineMeeting = true;
      params.onlineMeetingProvider = meetingProvider;
    }
    if (title) {
      params.subject = title;
    }

    try {
      // Fetch events
      const response = await this.graphClient
        .api(`/me/events/${id}`)
        .patch(params);

      return {
        rawData: response,
        events: this.toEvents(response.value || []),
      };
    } catch (cause) {
      console.error("An error occured in Microsoft services (update)", cause);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "An error occured in Microsoft services",
        cause,
      });
    }
  }

  // Priority between providers = teamsForBusiness > skypeForBusiness > skypeForConsumer
  async getAllowedMeetingProvider(): Promise<MicrosoftMeetingProviders> {
    let meetingProvider: MicrosoftMeetingProviders = "skypeForConsumer";

    try {
      // Fetch events
      // FIXME: Types
      const calInfo = await this.graphClient.api("/me/calendar").get();
      if (calInfo.allowedOnlineMeetingProviders.includes("teamsForBusiness")) {
        meetingProvider = "teamsForBusiness";
      } else if (
        calInfo.allowedOnlineMeetingProviders.includes("skypeForBusiness")
      ) {
        meetingProvider = "skypeForBusiness";
        // eslint-disable-next-line no-extra-boolean-cast
      } else if (!!calInfo.allowedOnlineMeetingProviders[0]) {
        meetingProvider = calInfo.allowedOnlineMeetingProviders[0];
      }
    } catch (error) {
      // no-op
    }

    return meetingProvider;
  }

  async deleteEvent(id: string) {
    try {
      const response = await this.graphClient
        .api(`/me/calendar/events/${id}`)
        .delete();

      return {
        rawData: response,
      };
    } catch (cause) {
      console.error("An error occured in Microsoft services (delete)", cause);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "An error occured in Microsoft services",
        cause,
      });
    }
  }
}
