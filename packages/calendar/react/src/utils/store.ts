import create from "zustand";
import { store } from "@agreeto/calendar-core";

// Binding our vanilla store to React
export const useStore = create(store);
