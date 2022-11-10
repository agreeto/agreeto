import type { FC} from 'react';
import { useState } from 'react'
import leftArrowIcon from '../../assets/left-arrow.svg'
import rightArrowIcon from '../../assets/right-arrow.svg'
import { addDays, getISOWeek } from 'date-fns'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import arrowDownIcon from '../../assets/arrow-down.svg'
import { useSelector } from 'react-redux'
import type { RootState } from '../../redux/store'
import {
  getPrimaryTimeZone,
  getTimeZoneAbv,
} from '../../utils/time-zone.helper'

export type CalendarType = '5 days' | '7 days'

type Props = {
  date: Date
  onPrevious?: () => void
  onNext?: () => void
  onToday?: () => void
   
  onCalendarTypeChange?: (type: CalendarType) => void
}

const ControlBar: FC<Props> = ({
  date,
  onPrevious,
  onNext,
  onToday,
  onCalendarTypeChange,
}) => {
  const month = date.toLocaleString(undefined, { month: 'long' })
  const year = date.toLocaleString(undefined, { year: 'numeric' })
  // 2 days added to get the start of the week.
  // Otherwise it will get the saturday of the previous week
  const weekNumber = getISOWeek(addDays(date, 2))

  // Redux
  const { timeZones } = useSelector((state: RootState) => state.timeZone)
  const primaryTimeZone = getPrimaryTimeZone(timeZones)

  const [calendarType, setCalendarType] = useState<CalendarType>('5 days')

  // const handleFeedback = () => {
  //   console.log('Show feedback page here')
  // }

  return (
    <>
      <div className="flex justify-between">
        {/* Left part */}
        <div>
          <div className="flex items-center space-x-4">
            {/* Date */}
            <div className="color-gray-600 font-semibold text-xl w-64">
              <span>{`${month} ${year}, Week ${weekNumber}`}</span>
            </div>

            {/* Arrows and today button */}
            <div>
              <button className="icon-button" onClick={onPrevious}>
                <img src={leftArrowIcon} alt="previous" />
              </button>
            </div>
            <div>
              <button className="icon-button" onClick={onNext}>
                <img src={rightArrowIcon} alt="next" />
              </button>
            </div>

            <div>
              <button className="button-outline" onClick={onToday}>
                Today
              </button>
            </div>
          </div>
        </div>

        {/* Right part */}
        <div className="self-center">
          <div className="flex space-x-4 items-center">
            <div>
              {/* <div
                className="color-gray-300 bg-transparent text-xs cursor-pointer"
                onClick={handleFeedback}
              >
                Give us a feedback
              </div> */}
            </div>

            {/* Remove hidden to show 5-7 days change */}
            <div className="hidden">
              <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                  <div className="bg-white color-gray-700 rounded border border-gray-300 flex py-1 px-2 items-center space-x-3">
                    <div className="text-sm">{calendarType}</div>
                    <div>
                      <img src={arrowDownIcon} width={12} height={7} />
                    </div>
                  </div>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content
                  className="z-10 bg-white color-gray-700 rounded shadow-xl"
                  align="end"
                >
                  <DropdownMenu.Item
                    onSelect={() => {
                      setCalendarType('5 days')
                      onCalendarTypeChange?.('5 days')
                    }}
                  >
                    <div className="pl-4 py-3 flex items-center w-40 cursor-pointer">
                      5 days
                    </div>
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator
                    className="bg-gray-100 mx-3"
                    style={{ height: '1px' }}
                  />
                  <DropdownMenu.Item
                    onSelect={() => {
                      setCalendarType('7 days')
                      onCalendarTypeChange?.('7 days')
                    }}
                  >
                    <div className="pl-4 py-3 flex items-center w-40 cursor-pointer">
                      7 days
                    </div>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </div>
          </div>
        </div>
      </div>

      {/* Timezone */}
      <div className="text-xs color-gray-600">
        {`(${getTimeZoneAbv(primaryTimeZone)}) ${primaryTimeZone}`}
      </div>
    </>
  )
}

export default ControlBar
