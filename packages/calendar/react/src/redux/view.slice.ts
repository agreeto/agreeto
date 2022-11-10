import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface TimeZoneState {
  openPane: "action" | "confirmation";
}

const initialState: TimeZoneState = {
  openPane: "action",
};

export const viewSlice = createSlice({
  name: "view",
  initialState,
  reducers: {
    changePane: (
      state,
      { payload }: PayloadAction<"action" | "confirmation">
    ) => {
      state.openPane = payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { changePane } = viewSlice.actions;

export default viewSlice.reducer;
