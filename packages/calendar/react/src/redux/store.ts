import { configureStore } from '@reduxjs/toolkit'
import { useDispatch } from 'react-redux'
import timeZoneSlice from './time-zone.slice'
import viewSlice from './view.slice'

export const store = configureStore({
  reducer: {
    timeZone: timeZoneSlice,
    view: viewSlice,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export const useAppDispatch = () => useDispatch<AppDispatch>()
