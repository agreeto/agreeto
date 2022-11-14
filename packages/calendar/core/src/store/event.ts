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
  updateTitle: (title: string) => void;
  resetTitle: () => void;
  setPeriod: (start: Date, end: Date) => void;
  selectSlot: (slot: EventInput) => void;
  deleteSlot: (slot: EventInput) => void;
  updateSlots: (slot: EventInput) => void;
  clearSlots: () => void;
  setCheckedEvent: (event: EventGroupEvent | null) => void;
  setHoveredEvent: (event: EventGroupEvent | null) => void;
  selectEventGroup: (id: string | null) => void;
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
  setDirectoryUsersWithEvents(users) {
    set({ directoryUsersWithEvents: users });
  },
}));
