import { BiChevronDown, BiChevronLeft, BiChevronRight } from "react-icons/bi";
import { addDays, endOfWeek, getISOWeek, startOfWeek } from "date-fns";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { getPrimaryTimeZone, getTimeZoneAbv } from "@agreeto/calendar-core";
import { useCalendarStore, useTZStore } from "../../utils/store";
import { type CalendarApi } from "@fullcalendar/react";
import { Button } from "@agreeto/ui";

export const ControlBar: React.FC<{
  // FIXME: Is there no type for this?
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  calendarRef: any;
}> = ({ calendarRef }) => {
  const setPeriod = useCalendarStore((s) => s.setPeriod);
  const focusedDate = useCalendarStore((s) => s.focusedDate);
  const setFocusedDate = useCalendarStore((s) => s.setFocusedDate);
  const calendarType = useCalendarStore((s) => s.calendarType);
  const setCalendarType = useCalendarStore((s) => s.setCalendarType);
  const setShowWeekends = useCalendarStore((s) => s.setShowWeekends);

  const month = focusedDate.toLocaleString(undefined, { month: "long" });
  const year = focusedDate.toLocaleString(undefined, { year: "numeric" });
  // 2 days added to get the start of the week.
  // Otherwise it will get the saturday of the previous week
  const weekNumber = getISOWeek(addDays(focusedDate, 2));

  const timeZones = useTZStore((s) => s.timeZones);
  const primaryTimeZone = getPrimaryTimeZone(timeZones);

  // const handleFeedback = () => {
  //   console.log('Show feedback page here')
  // }

  const handleDateChange = (action: "prev" | "next" | "today") => {
    const calendarApi: CalendarApi = calendarRef.current.getApi();
    calendarApi[action]();
    const date = calendarApi.getDate();
    setFocusedDate(new Date(calendarApi.view.currentStart));
    setPeriod(startOfWeek(date), endOfWeek(date));
  };

  return (
    <>
      <div className="flex justify-between">
        {/* Left part */}
        <div>
          <div className="flex items-center space-x-3">
            {/* Date */}
            <div className="w-64 text-xl font-semibold text-gray-600">
              <span>{`${month} ${year}, Week ${weekNumber}`}</span>
            </div>

            {/* Arrows and today button */}
            <div>
              <Button
                variant="glass"
                className="p-1 text-gray-900"
                onClick={() => handleDateChange("prev")}
              >
                <BiChevronLeft className="h-6 w-6" />
              </Button>
            </div>
            <div>
              <Button
                variant="glass"
                className="p-1 text-gray-900"
                onClick={() => handleDateChange("next")}
              >
                <BiChevronRight className="h-6 w-6" />
              </Button>
            </div>

            <div>
              <Button
                variant="glass"
                className="p-1 text-gray-900"
                onClick={() => handleDateChange("today")}
              >
                <span className="h-6 leading-6">Today</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Right part */}
        <div className="self-center">
          <div className="flex items-center space-x-4">
            <div>
              {/* <div
                className="text-gray-300 bg-transparent text-xs cursor-pointer"
                onClick={handleFeedback}
              >
                Give us a feedback
              </div> */}
            </div>

            {/* Remove hidden to show 5-7 days change */}
            <div className="hidden">
              <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                  <div className="flex items-center space-x-3 rounded border border-gray-300 bg-white py-1 px-2 text-gray-700">
                    <div className="text-sm">{calendarType}</div>
                    <BiChevronDown className="h-4 w-4" />
                  </div>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content
                  className="z-10 rounded bg-white text-gray-700 shadow-xl"
                  align="end"
                >
                  <DropdownMenu.Item
                    onSelect={() => {
                      setCalendarType("5 days");
                      setShowWeekends(false);
                    }}
                  >
                    <div className="flex w-40 cursor-pointer items-center py-3 pl-4">
                      5 days
                    </div>
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator
                    className="mx-3 bg-gray-100"
                    style={{ height: "1px" }}
                  />
                  <DropdownMenu.Item
                    onSelect={() => {
                      setCalendarType("7 days");
                      setShowWeekends(true);
                    }}
                  >
                    <div className="flex w-40 cursor-pointer items-center py-3 pl-4">
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
      <div className="text-xs text-gray-600">
        {`(${getTimeZoneAbv(primaryTimeZone)}) ${primaryTimeZone}`}
      </div>
    </>
  );
};
