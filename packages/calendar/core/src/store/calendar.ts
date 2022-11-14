import create from "zustand/vanilla";

type CalendarType = "5 days" | "7 days";

export interface CalendarStore {
  // State
  focusedDate: Date;
  showWeekends: boolean;
  calendarType: CalendarType;

  // Actions
  setFocusedDate: (date: Date) => void;
  setShowWeekends: (show: boolean) => void;
  setCalendarType: (type: CalendarType) => void;
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
}));
