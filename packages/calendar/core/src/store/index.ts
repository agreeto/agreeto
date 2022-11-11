// This store is not bound to React
import create from "zustand/vanilla";

import { createTimeZoneSlice, type TimeZoneSlice } from "./timezone.slice";
import { createViewSlice, type ViewSlice } from "./view.slice";

export type MyState = TimeZoneSlice & ViewSlice;

export const store = create<MyState>()((...a) => ({
  ...createTimeZoneSlice(...a),
  ...createViewSlice(...a),
}));
