export const API_URL = import.meta.env?.VITE_API_URL as string

export const LOCAL_STORAGE_KEYS = {
  TIME_ZONES: 'timeZones',
  SELECTED_TIME_ZONE: 'selectedTimeZone',
  PRIMARY_TIME_ZONE: 'primaryTimeZone',
  RECENTLY_USED_TIME_ZONES: 'recentlyUsedTimeZones',
  PRIMARY_ACTION_BUTTON_TYPE: 'primaryActionButtonType',
}

export type PLATFORM = 'ext' | 'web' | 'addin'
