import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { LOCAL_STORAGE_KEYS, type PLATFORM } from "../utils/constants";
import uniq from "lodash/uniq";
import { Membership } from "@agreeto/db";
import { type RouterOutputs } from "../utils/trpc";

export interface TimeZoneState {
  platform: PLATFORM;
  timeZones: string[];
  selectedTimeZone: string;
  recentlyUsedTimeZones: string[];
}

type SetTimeZoneDefaultsParams = {
  platform: PLATFORM;
  user: RouterOutputs["user"]["me"] | undefined;
};

export const setTimeZoneDefaults = createAsyncThunk(
  "set-time-zone-defaults",
  async ({ platform, user }: SetTimeZoneDefaultsParams) => {
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

      // Return data
      return {
        platform,
        timeZones: data[LOCAL_STORAGE_KEYS.TIME_ZONES],
        selectedTimeZone: data[LOCAL_STORAGE_KEYS.SELECTED_TIME_ZONE],
        recentlyUsedTimeZones:
          data[LOCAL_STORAGE_KEYS.RECENTLY_USED_TIME_ZONES],
      };
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
      if (!timeZonesLS.includes(selectedTimeZoneLS)) {
        selectedTimeZoneLS = timeZonesLS[0];
      }

      // Return data
      return {
        platform,
        timeZones: timeZonesLS,
        selectedTimeZone: selectedTimeZoneLS,
        recentlyUsedTimeZones:
          recentlyUsedTimeZonesLS.length > 0
            ? recentlyUsedTimeZonesLS
            : [Intl.DateTimeFormat().resolvedOptions().timeZone],
      };
    }
  }
);

const initialState: TimeZoneState = {
  platform: "web",
  timeZones: [],
  selectedTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  recentlyUsedTimeZones: [],
};

export const timeZoneSlice = createSlice({
  name: "timeZone",
  initialState,
  extraReducers: (builder) => {
    // Set default time zones
    builder.addCase(setTimeZoneDefaults.fulfilled, (state, { payload }) => {
      state.platform = payload.platform;
      state.timeZones = payload.timeZones;
      state.selectedTimeZone = payload.selectedTimeZone;
      state.recentlyUsedTimeZones = payload.recentlyUsedTimeZones;
    });
  },
  reducers: {
    addTimeZone: (state, { payload: addedTimeZone }: PayloadAction<string>) => {
      const newTimeZones = [addedTimeZone, ...state.timeZones].slice(0, 2);
      state.timeZones = newTimeZones;

      if (state.platform === "ext") {
        chrome.storage.local.set({
          [LOCAL_STORAGE_KEYS.TIME_ZONES]: newTimeZones,
        });
      } else {
        localStorage.setItem(
          LOCAL_STORAGE_KEYS.TIME_ZONES,
          JSON.stringify(newTimeZones)
        );
      }

      // Set selected time zone
      if (state.platform === "ext") {
        chrome.storage.local.set({
          [LOCAL_STORAGE_KEYS.SELECTED_TIME_ZONE]: addedTimeZone,
        });
      } else {
        localStorage.setItem(
          LOCAL_STORAGE_KEYS.SELECTED_TIME_ZONE,
          addedTimeZone
        );
      }
      state.selectedTimeZone = addedTimeZone;

      // Update recently used
      const newRecentlyUsed = uniq([
        addedTimeZone,
        ...state.recentlyUsedTimeZones,
      ]).slice(0, 5);
      state.recentlyUsedTimeZones = newRecentlyUsed;
      if (state.platform === "ext") {
        chrome.storage.local.set({
          [LOCAL_STORAGE_KEYS.RECENTLY_USED_TIME_ZONES]: newRecentlyUsed,
        });
      } else {
        localStorage.setItem(
          LOCAL_STORAGE_KEYS.RECENTLY_USED_TIME_ZONES,
          JSON.stringify(newRecentlyUsed)
        );
      }
    },
    changeTimeZone: (
      state,
      { payload }: PayloadAction<{ timeZone: string; index: number }>
    ) => {
      const { timeZone, index } = payload;
      if (!state.timeZones[index]) return;

      const oldTimeZone = state.timeZones[index];
      const newTimeZones = [...state.timeZones];
      newTimeZones[index] = timeZone;
      state.timeZones = newTimeZones;

      if (state.platform === "ext") {
        chrome.storage.local.set({
          [LOCAL_STORAGE_KEYS.TIME_ZONES]: newTimeZones,
        });
      } else {
        localStorage.setItem(
          LOCAL_STORAGE_KEYS.TIME_ZONES,
          JSON.stringify(newTimeZones)
        );
      }

      // Update selected if necessary
      if (oldTimeZone === state.selectedTimeZone) {
        state.selectedTimeZone = timeZone;
        if (state.platform === "ext") {
          chrome.storage.local.set({
            [LOCAL_STORAGE_KEYS.SELECTED_TIME_ZONE]: timeZone,
          });
        } else {
          localStorage.setItem(LOCAL_STORAGE_KEYS.SELECTED_TIME_ZONE, timeZone);
        }
      }

      // Update recently used
      const newRecentlyUsed = uniq([
        timeZone,
        ...state.recentlyUsedTimeZones,
      ]).slice(0, 5);
      state.recentlyUsedTimeZones = newRecentlyUsed;
      if (state.platform === "ext") {
        chrome.storage.local.set({
          [LOCAL_STORAGE_KEYS.RECENTLY_USED_TIME_ZONES]: newRecentlyUsed,
        });
      } else {
        localStorage.setItem(
          LOCAL_STORAGE_KEYS.RECENTLY_USED_TIME_ZONES,
          JSON.stringify(newRecentlyUsed)
        );
      }
    },
    deleteTimeZone: (
      state,
      { payload: deletedTimeZone }: PayloadAction<string>
    ) => {
      let deletedOne = false;
      const newTimeZones = state.timeZones.filter((tze) => {
        // This parameter is put here to avoid multi delete of the same time period
        if (deletedOne) return true;

        const shouldKeep = tze !== deletedTimeZone;
        if (!shouldKeep && !deletedOne) {
          deletedOne = true;
        }
        return shouldKeep;
      });
      state.timeZones = newTimeZones;

      if (state.platform === "ext") {
        chrome.storage.local.set({
          [LOCAL_STORAGE_KEYS.TIME_ZONES]: newTimeZones,
        });
      } else {
        localStorage.setItem(
          LOCAL_STORAGE_KEYS.TIME_ZONES,
          JSON.stringify(newTimeZones)
        );
      }

      // This is supposed to be true always
      if (newTimeZones[0]) {
        // Set selected time zone
        if (state.platform === "ext") {
          chrome.storage.local.set({
            [LOCAL_STORAGE_KEYS.SELECTED_TIME_ZONE]: newTimeZones[0],
          });
        } else {
          localStorage.setItem(
            LOCAL_STORAGE_KEYS.SELECTED_TIME_ZONE,
            newTimeZones[0]
          );
        }
        state.selectedTimeZone = newTimeZones[0];
      }
    },
    changeSelectedTimeZone: (
      state,
      { payload: selectedTimeZone }: PayloadAction<string>
    ) => {
      if (!state.timeZones.includes(selectedTimeZone)) return;

      state.selectedTimeZone = selectedTimeZone;
      if (state.platform === "ext") {
        chrome.storage.local.set({
          [LOCAL_STORAGE_KEYS.SELECTED_TIME_ZONE]: selectedTimeZone,
        });
      } else {
        localStorage.setItem(
          LOCAL_STORAGE_KEYS.SELECTED_TIME_ZONE,
          selectedTimeZone
        );
      }
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  addTimeZone,
  changeTimeZone,
  deleteTimeZone,
  changeSelectedTimeZone,
} = timeZoneSlice.actions;

export default timeZoneSlice.reducer;
