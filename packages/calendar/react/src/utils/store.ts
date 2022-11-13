import create from "zustand";
import {
  calendarStore,
  eventStore,
  tzStore,
  viewStore,
} from "@agreeto/calendar-core";

// Binding our vanilla store to React
export const useCalendarStore = create(calendarStore);
export const useEventStore = create(eventStore);
export const useTZStore = create(tzStore);
export const useViewStore = create(viewStore);
