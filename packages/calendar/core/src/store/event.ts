import { type RouterOutputs } from "@agreeto/api";
import { type EventInput } from "@fullcalendar/react";
import { endOfWeek, startOfWeek } from "date-fns";
import create from "zustand/vanilla";

type EventGroupEvent = RouterOutputs["eventGroup"]["byId"]["events"][number];
type DirectoryUser = RouterOutputs["event"]["directoryUsers"][number];

export interface EventStore {
  // State
  title: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  selectedSlots: EventInput[];
  checkedEvent: EventGroupEvent | null;
  hoveredEvent: EventGroupEvent | null;
  selectedEventGroupId: string | null;
  directoryUsersWithEvents: DirectoryUser[];

  // Actions
  setTitle: (title: string) => void;
  setPeriod: (start: Date, end: Date) => void;
  selectSlot: (slot: EventInput) => void;
  setCheckedEvent: (event: EventGroupEvent | null) => void;
  setHoveredEvent: (event: EventGroupEvent | null) => void;
  setSelectedEventGroupId: (id: string | null) => void;
  setDirectoryUsersWithEvents: (users: DirectoryUser[]) => void;
}

export const eventStore = create<EventStore>()((set) => ({
  // State
  title: "Hold: ",
  period: {
    startDate: startOfWeek(new Date()),
    endDate: endOfWeek(new Date()),
  },
  selectedSlots: [],
  checkedEvent: null,
  hoveredEvent: null,
  selectedEventGroupId: null,
  directoryUsersWithEvents: [],

  // Actions
  setTitle(title) {
    set({ title });
  },
  setPeriod(startDate, endDate) {
    set({
      period: { startDate, endDate },
    });
  },
  selectSlot(slot) {
    set((state) => ({
      selectedSlots: [...state.selectedSlots, slot],
    }));
  },
  setCheckedEvent(event) {
    set({
      checkedEvent: event,
    });
  },
  setHoveredEvent(event) {
    set({ hoveredEvent: event });
  },
  setSelectedEventGroupId(id) {
    set({ selectedEventGroupId: id });
  },
  setDirectoryUsersWithEvents(users) {
    set({ directoryUsersWithEvents: users });
  },
}));
