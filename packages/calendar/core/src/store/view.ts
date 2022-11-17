import { type StateCreator } from "zustand/vanilla";
import { type EventStore } from "./event";
export interface ViewSlice {
  // State
  openPane: "action" | "confirmation";

  // Actions
  changePane: (pane: "action" | "confirmation") => void;
}

/**
 * Since we trigger side-effects when changing panes, we keep it in the event store but
 * separate it into its own slice.
 */
export const createViewSlice: StateCreator<EventStore, [], [], ViewSlice> = (
  set,
  get,
) => ({
  // State
  openPane: "action",

  // Actions
  changePane(newPane) {
    // Unselect the event group if we're closing the confirmation pane
    const { openPane, selectedEventGroupId } = get();
    const resetEG = openPane === "confirmation";

    set({
      openPane: newPane,
      selectedEventGroupId: resetEG ? null : selectedEventGroupId,
    });
  },
});
