import create from "zustand/vanilla";
import { endOfWeek, startOfWeek } from "date-fns";

type CalendarType = "5 days" | "7 days";

export interface CalendarStore {
  // State
  focusedDate: Date;
  showWeekends: boolean;
  calendarType: CalendarType;
  period: {
    startDate: Date;
    endDate: Date;
  };

  // Actions
  setFocusedDate: (date: Date) => void;
  setShowWeekends: (show: boolean) => void;
  setCalendarType: (type: CalendarType) => void;
  setPeriod: (start: Date, end: Date) => void;
}

/**
 * We could maybe use something more primitive like Jotai for this,
 * but staying at zustand for now.
 */
export const calendarStore = create<CalendarStore>()((set) => ({
  // State
  focusedDate: new Date(),
  showWeekends: true,
  calendarType: "7 days",
  period: {
    startDate: startOfWeek(new Date()),
    endDate: endOfWeek(new Date()),
  },

  // Actions
  setFocusedDate(date) {
    set({
      focusedDate: date,
    });
  },
  setShowWeekends(show) {
    set({
      showWeekends: show,
    });
  },
  setCalendarType(type) {
    set({
      calendarType: type,
    });
  },
  setPeriod(startDate, endDate) {
    set({
      period: { startDate, endDate },
    });
  },
}));
