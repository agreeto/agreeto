import create from "zustand/vanilla";

export interface ViewStore {
  // State
  openPane: "action" | "confirmation";

  // Actions
  changePane: (pane: "action" | "confirmation") => void;
}

export const viewStore = create<ViewStore>()((set, _get) => ({
  // State
  openPane: "action",

  // Actions
  changePane(pane) {
    set(() => ({ openPane: pane }));
  },
}));
