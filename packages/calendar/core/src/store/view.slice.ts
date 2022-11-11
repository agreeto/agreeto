import { type StateCreator } from "zustand/vanilla";
import { type MyState } from ".";

export interface ViewSlice {
  // State
  openPane: "action" | "confirmation";

  // Actions
  changePane: (pane: "action" | "confirmation") => void;
}

export const createViewSlice: StateCreator<MyState, [], [], ViewSlice> = (
  set,
) => ({
  // State
  openPane: "action",

  // Actions
  changePane: (pane) => set(() => ({ openPane: pane })),
});
