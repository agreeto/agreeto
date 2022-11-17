import { type Attendee } from "@agreeto/db";

export interface ICreateEvent {
  title: string;
  startDate: Date;
  endDate: Date;
  attendees?: Attendee[]; // This is used to create attendees on our db
  attendeeEmails?: string[]; // This is used to create attendees on providers
}

export interface IUpdateEvent {
  hasConference?: boolean;
  title?: string;
  attendees?: Attendee[]; // This is used to create attendees on our db
  attendeeEmails?: string[]; // This is used to create attendees on providers
}

export interface IGetEvents {
  startDate?: Date;
  endDate?: Date;
  email?: string;
}
