import create from "zustand";
import { tzStore, viewStore } from "@agreeto/calendar-core";

// Binding our vanilla store to React
export const useTZStore = create(tzStore);
export const useViewStore = create(viewStore);
