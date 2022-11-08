import { type Event, EventResponseStatus, type Attendee } from "@agreeto/db";
import { type calendar_v3, google } from "googleapis";
import { type ICreateEvent, type IGetEvents, type IUpdateEvent } from "./types";

export class GoogleCalendarService {
  private accessToken: string;
  private refreshToken: string;
  private oauthClient = new google.auth.OAuth2(
    process.env.GOOGLE_ID,
    process.env.GOOGLE_SECRET
  );
  private calendarClient: calendar_v3.Calendar;

  constructor(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;

    this.oauthClient.setCredentials({
      access_token: this.accessToken,
      refresh_token: this.refreshToken,
    });
    this.calendarClient = google.calendar({
      version: "v3",
      auth: this.oauthClient,
    });
  }

  private toEvent({
    id,
    start,
    end,
    summary,
    description,
    attendees,
    extendedProperties,
  }: calendar_v3.Schema$Event): Partial<Event & { attendees: Attendee[] }> {
    const extractResponse = (status: string) => {
      return status === "accepted"
        ? EventResponseStatus.ACCEPTED
        : status === "declined"
        ? EventResponseStatus.DECLINED
        : status === "tentative"
        ? EventResponseStatus.TENTATIVE
        : EventResponseStatus.NEEDS_ACTION;
    };

    return {
      id: id!,
      title: summary || "-",
      description: description || "",
      startDate: new Date(start!.dateTime!),
      endDate: new Date(end!.dateTime!),
      isAgreeToEvent: Boolean(
        extendedProperties?.private?.isAgreeToEvent === "true"
      ),
      attendees: !attendees
        ? []
        : attendees.map((a) => ({
            id: a.id!,
            eventId: id!,
            email: a.email!,
            name: a.displayName || "",
            surname: "",
            provider: "google",
            responseStatus: extractResponse(a.responseStatus!),
          })),
    };
  }

  private toEvents(items: calendar_v3.Schema$Event[]): Partial<Event>[] {
    return items.map((item) => this.toEvent(item));
  }

  async getEvents({ startDate, endDate, email }: IGetEvents) {
    // Generate the query params
    const params: calendar_v3.Params$Resource$Events$List = {
      calendarId: email || "primary",
      orderBy: "startTime",
      maxResults: 100,
      singleEvents: true,
    };

    if (startDate) params.timeMin = new Date(startDate).toISOString();
    if (endDate) params.timeMax = new Date(endDate).toISOString();

    // Fetch events
    const response = await this.calendarClient.events.list(params);

    return {
      rawData: response.data,
      events: this.toEvents(response.data.items || []),
    };
  }

  async createEvent({
    id,
    title,
    startDate,
    endDate,
    attendeeEmails,
  }: ICreateEvent) {
    // Generate the query params
    const params: calendar_v3.Params$Resource$Events$Insert = {
      calendarId: "primary",
      sendNotifications: true,
      sendUpdates: "all",
      requestBody: {
        id,
        summary: title,
        start: {
          dateTime: startDate.toISOString(),
        },
        end: {
          dateTime: endDate.toISOString(),
        },
        extendedProperties: {
          private: {
            isAgreeToEvent: "true",
          },
        },
        attendees: attendeeEmails?.map((email) => ({ email })),
      },
    };

    // Create event
    const response = await this.calendarClient.events.insert(params);

    return {
      rawData: response.data,
      event: this.toEvent(response.data),
    };
  }

  async updateEvent(
    id: string,
    { hasConference, title, attendeeEmails }: IUpdateEvent
  ) {
    const params: calendar_v3.Params$Resource$Events$Patch = {
      calendarId: "primary",
      eventId: id,
      sendNotifications: true,
      sendUpdates: "all",
      requestBody: {},
    };

    if (attendeeEmails) {
      params.requestBody = {
        ...params.requestBody,
        attendees: attendeeEmails.map((email) => ({
          email,
          responseStatus: EventResponseStatus.ACCEPTED.toLowerCase(),
        })),
      };
    }
    if (hasConference) {
      params.conferenceDataVersion = 1;
      params.requestBody = {
        ...params.requestBody,
        conferenceData: {
          createRequest: {
            requestId: id,
            conferenceSolutionKey: {
              type: "hangoutsMeet",
            },
          },
        },
      };
    }
    if (title) {
      params.requestBody = {
        ...params.requestBody,
        summary: title,
      };
    }

    // Update event
    const response = await this.calendarClient.events.patch(params);

    return {
      rawData: response.data,
      event: this.toEvent(response.data),
    };
  }

  async deleteEvent(id: string) {
    // Reset calendar client to apply retry config
    this.calendarClient = google.calendar({
      version: "v3",
      auth: this.oauthClient,
      retryConfig: {
        retryDelay: 1000, // 1 second
        retry: 10,
        statusCodesToRetry: [
          [403, 403],
          [429, 429],
        ],
      },
    });

    // Generate the query params
    const params: calendar_v3.Params$Resource$Events$Delete = {
      calendarId: "primary",
      eventId: id,
    };

    // Fetch events
    const response = await this.calendarClient.events.delete(params);

    return {
      rawData: response.data,
    };
  }
}
