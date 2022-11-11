import { type RouterOutputs } from "@agreeto/api";
import { type StateCreator } from "zustand/vanilla";
import { type MyState } from ".";

import { LOCAL_STORAGE_KEYS, type PLATFORM } from "../constants";
import { Membership, type Maybe } from "../types";

type User = Maybe<RouterOutputs["user"]["me"]>;

export interface TimeZoneSlice {
  // State
  platform: PLATFORM;
  timeZones: string[];
  selectedTimeZone: string;
  recentlyUsedTimeZones: string[];

  // Actions
  setTimeZoneDefaults: (user: User, platform: PLATFORM) => void;
  addTimeZone: (tz: string) => void;
  changeTimeZone: (tz: string, idx: number) => void;
  deleteTimeZone: (tz: string) => void;
  changeSelectedTimeZone: (tz: string) => void;
}

export const createTimeZoneSlice: StateCreator<
  MyState,
  [],
  [],
  TimeZoneSlice
> = (set) => ({
  // State
  platform: "web",
  timeZones: [],
  selectedTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  recentlyUsedTimeZones: [],

  // Actions
  addTimeZone: (tz) =>
    set((state) => {
      const timeZones = [tz, ...state.timeZones].slice(0, 2);

      // Update recently used
      const recentlyUsed = [
        ...new Set([tz, ...state.recentlyUsedTimeZones]),
      ].slice(0, 5);

      // Update persistent storage
      if (state.platform === "ext") {
        chrome.storage.local.set({
          [LOCAL_STORAGE_KEYS.SELECTED_TIME_ZONE]: tz,
          [LOCAL_STORAGE_KEYS.RECENTLY_USED_TIME_ZONES]: recentlyUsed,
        });
      } else {
        localStorage.setItem(LOCAL_STORAGE_KEYS.SELECTED_TIME_ZONE, tz);
        localStorage.setItem(
          LOCAL_STORAGE_KEYS.RECENTLY_USED_TIME_ZONES,
          JSON.stringify(recentlyUsed)
        );
      }

      return {
        timeZones,
        selectedTimeZone: tz,
        recentlyUsedTimeZones: recentlyUsed,
      };
    }),

  changeTimeZone: (tz, idx) =>
    set((state) => {
      const old = state.timeZones[idx];
      if (!old) return {};
      const isSelected = state.selectedTimeZone === old;

      const timeZones = [...state.timeZones];
      timeZones[idx] = tz;

      // Update persistent storage
      if (state.platform === "ext") {
        chrome.storage.local.set(
          isSelected
            ? {
                [LOCAL_STORAGE_KEYS.TIME_ZONES]: timeZones,
                [LOCAL_STORAGE_KEYS.SELECTED_TIME_ZONE]: tz,
              }
            : {
                [LOCAL_STORAGE_KEYS.TIME_ZONES]: timeZones,
              }
        );
      } else {
        localStorage.setItem(
          LOCAL_STORAGE_KEYS.TIME_ZONES,
          JSON.stringify(timeZones)
        );
        isSelected &&
          localStorage.setItem(LOCAL_STORAGE_KEYS.SELECTED_TIME_ZONE, tz);
      }

      return {
        timeZones,
        selectedTimeZone: isSelected ? tz : state.selectedTimeZone,
      };
    }),

  deleteTimeZone: (tz) =>
    set((state) => {
      let hasDeleted = false;
      const timeZones = state.timeZones.filter((t) => {
        if (hasDeleted) return true;

        const shouldKeep = t !== tz;
        if (!shouldKeep && !hasDeleted) {
          hasDeleted = true;
        }
        return shouldKeep;
      });

      if (state.platform === "ext") {
        chrome.storage.local.set(
          // This should always resolve to true (update both)
          timeZones[0]
            ? {
                [LOCAL_STORAGE_KEYS.TIME_ZONES]: timeZones,
                [LOCAL_STORAGE_KEYS.SELECTED_TIME_ZONE]: timeZones[0],
              }
            : {
                [LOCAL_STORAGE_KEYS.TIME_ZONES]: timeZones,
              }
        );
      } else {
        localStorage.setItem(
          LOCAL_STORAGE_KEYS.TIME_ZONES,
          JSON.stringify(timeZones)
        );
        timeZones[0] &&
          localStorage.setItem(
            LOCAL_STORAGE_KEYS.SELECTED_TIME_ZONE,
            timeZones[0]
          );
      }

      return {
        timeZones,
        selectedTimeZone: timeZones[0] ?? state.selectedTimeZone,
      };
    }),

  changeSelectedTimeZone: (tz) =>
    set((state) => {
      const isValid = state.timeZones.includes(tz);
      if (!isValid) return {};

      if (state.platform === "ext") {
        chrome.storage.local.set({
          [LOCAL_STORAGE_KEYS.SELECTED_TIME_ZONE]: tz,
        });
      } else {
        localStorage.setItem(LOCAL_STORAGE_KEYS.SELECTED_TIME_ZONE, tz);
      }

      return {
        selectedTimeZone: tz,
      };
    }),

  setTimeZoneDefaults: async (user, platform) => {
    const freeUser = user?.membership === Membership.FREE;

    if (platform === "ext") {
      // Get data from chrome storage
      const data = await chrome?.storage.local.get({
        [LOCAL_STORAGE_KEYS.TIME_ZONES]: [],
        [LOCAL_STORAGE_KEYS.SELECTED_TIME_ZONE]:
          Intl.DateTimeFormat().resolvedOptions().timeZone,
        [LOCAL_STORAGE_KEYS.RECENTLY_USED_TIME_ZONES]: [],
      });

      // If user is free and has multiple time zones then delete one of them
      if (freeUser && data[LOCAL_STORAGE_KEYS.TIME_ZONES].length > 1) {
        const slicedTimeZones = data[LOCAL_STORAGE_KEYS.TIME_ZONES].slice(0, 1);
        await chrome?.storage.local.set({
          [LOCAL_STORAGE_KEYS.TIME_ZONES]: slicedTimeZones,
        });
        data[LOCAL_STORAGE_KEYS.TIME_ZONES] = slicedTimeZones;
      }

      // If there is no time zone in the array then push the current time zone
      if (data[LOCAL_STORAGE_KEYS.TIME_ZONES].length === 0) {
        data[LOCAL_STORAGE_KEYS.TIME_ZONES].push(
          Intl.DateTimeFormat().resolvedOptions().timeZone
        );
      }
      // If selected time zone is not in the array, make the selected the first element
      if (
        !data[LOCAL_STORAGE_KEYS.TIME_ZONES].includes(
          data[LOCAL_STORAGE_KEYS.SELECTED_TIME_ZONE]
        )
      ) {
        data[LOCAL_STORAGE_KEYS.SELECTED_TIME_ZONE] =
          data[LOCAL_STORAGE_KEYS.TIME_ZONES][0];
      }

      // Set state once we're done with all the async stuff
      set(() => ({
        platform,
        timeZones: data[LOCAL_STORAGE_KEYS.TIME_ZONES],
        selectedTimeZone: data[LOCAL_STORAGE_KEYS.SELECTED_TIME_ZONE],
        recentlyUsedTimeZones:
          data[LOCAL_STORAGE_KEYS.RECENTLY_USED_TIME_ZONES],
      }));
    } else {
      // Get data from local storage
      let timeZonesLS: string[] = JSON.parse(
        localStorage.getItem(LOCAL_STORAGE_KEYS.TIME_ZONES) || "[]"
      ) as string[];
      let selectedTimeZoneLS =
        localStorage.getItem(LOCAL_STORAGE_KEYS.SELECTED_TIME_ZONE) ||
        Intl.DateTimeFormat().resolvedOptions().timeZone;
      const recentlyUsedTimeZonesLS: string[] = JSON.parse(
        localStorage.getItem(LOCAL_STORAGE_KEYS.RECENTLY_USED_TIME_ZONES) ||
          "[]"
      );

      // If user is free and has multiple time zones then delete one of them
      if (freeUser && timeZonesLS.length > 1) {
        const slicedTimeZones = timeZonesLS.slice(0, 1);
        localStorage.setItem(
          LOCAL_STORAGE_KEYS.TIME_ZONES,
          JSON.stringify(slicedTimeZones)
        );
        timeZonesLS = slicedTimeZones;
      }

      // If there is no time zone in the array then push the current time zone
      if (timeZonesLS.length === 0) {
        timeZonesLS = [Intl.DateTimeFormat().resolvedOptions().timeZone];
      }
      // If selected time zone is not in the array, make the selected the first element
      if (!timeZonesLS.includes(selectedTimeZoneLS) && timeZonesLS[0]) {
        selectedTimeZoneLS = timeZonesLS[0];
      }

      // Set state once we're done with all the async stuff
      set(() => ({
        platform,
        timeZones: timeZonesLS,
        selectedTimeZone: selectedTimeZoneLS,
        recentlyUsedTimeZones:
          recentlyUsedTimeZonesLS.length > 0
            ? recentlyUsedTimeZonesLS
            : [Intl.DateTimeFormat().resolvedOptions().timeZone],
      }));
    }
  },
});
