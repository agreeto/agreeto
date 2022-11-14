import { type RouterOutputs } from "@agreeto/api";
import { type EventInput } from "@fullcalendar/react";
import create from "zustand/vanilla";

type EventGroupEvent = RouterOutputs["eventGroup"]["byId"]["events"][number];
type DirectoryUser = RouterOutputs["event"]["directoryUsers"][number];
type Attendee = RouterOutputs["user"]["getFriends"][number];

// Contains the state of the current "booking" process
export interface EventStore {
  // State
  title: string;

  selectedSlots: EventInput[];
  checkedEvent: EventGroupEvent | null;
  hoveredEvent: EventGroupEvent | null;
  selectedEventGroupId: string | null;
  attendees: Attendee[];
  directoryUsersWithEvents: DirectoryUser[];

  // Actions
  updateTitle: (title: string) => void;
  resetTitle: () => void;
  selectSlot: (slot: EventInput) => void;
  deleteSlot: (slot: EventInput) => void;
  updateSlots: (slot: EventInput) => void;
  clearSlots: () => void;
  setCheckedEvent: (event: EventGroupEvent | null) => void;
  setHoveredEvent: (event: EventGroupEvent | null) => void;
  selectEventGroup: (id: string | null) => void;
  addAttendee: (attendee: Attendee) => void;
  removeAttendee: (id: string) => void;
  setDirectoryUsersWithEvents: (users: DirectoryUser[]) => void;
}

export const eventStore = create<EventStore>()((set) => ({
  // State
  title: "Hold: ",

  selectedSlots: [],
  checkedEvent: null,
  hoveredEvent: null,
  selectedEventGroupId: null,
  attendees: [],
  directoryUsersWithEvents: [],

  // Actions
  updateTitle(title) {
    set((state) => ({
      title,
      // update on all selected slots
      selectedSlots: state.selectedSlots.map((slot) => ({
        ...slot,
        title,
      })),
    }));
  },
  resetTitle() {
    set({
      title: "Hold: ",
    });
  },

  selectSlot(slot) {
    set((state) => ({
      selectedSlots: [...state.selectedSlots, slot],
    }));
  },
  deleteSlot(slot) {
    set((state) => ({
      selectedSlots: state.selectedSlots.filter((s) => s.id !== slot.id),
    }));
  },
  updateSlots(event) {
    if (event.extendedProps?.new) {
      set((state) => ({
        selectedSlots: state.selectedSlots.map((slot) =>
          slot.id !== event.id
            ? slot
            : {
                ...slot,
                // id: ulid(),
                start: event.start,
                end: event.end,
              },
        ),
      }));
    }
  },
  clearSlots() {
    set({
      selectedSlots: [],
    });
  },
  setCheckedEvent(event) {
    set({
      checkedEvent: event,
    });
  },
  setHoveredEvent(event) {
    set({ hoveredEvent: event });
  },
  selectEventGroup(id) {
    set({ selectedEventGroupId: id });
  },
  addAttendee(attendee) {
    set((state) => ({
      attendees: [...state.attendees, attendee],
    }));
  },
  removeAttendee(id) {
    set((state) => ({
      attendees: state.attendees.filter((a) => a.id !== id),
    }));
  },
  setDirectoryUsersWithEvents(users) {
    set({ directoryUsersWithEvents: users });
  },
}));
