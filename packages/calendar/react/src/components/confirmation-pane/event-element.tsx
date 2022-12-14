import React from "react";
import { type RouterOutputs } from "@agreeto/api";
import { HiCheckCircle } from "react-icons/hi";
import { format } from "date-fns-tz";
import { getPrimaryTimeZone, getTimeZoneAbv } from "@agreeto/calendar-core";
import { useEventStore, useTZStore } from "../../utils/store";

type EventGroupEvent = RouterOutputs["eventGroup"]["byId"]["events"][number];

export const EventElement: React.FC<{
  event: EventGroupEvent;
}> = ({ event }) => {
  const timeZones = useTZStore((s) => s.timeZones);

  const checkedEvent = useEventStore((s) => s.checkedEvent);
  const setHoveredEvent = useEventStore((s) => s.setHoveredEvent);
  const setCheckedEvent = useEventStore((s) => s.setCheckedEvent);

  const isChecked = event.id === checkedEvent?.id;

  return (
    <div
      key={event.id}
      onMouseEnter={() => !event.isSelected && setHoveredEvent(event)}
      onMouseLeave={() => !event.isSelected && setHoveredEvent(null)}
    >
      <label htmlFor={`selectEvent-${event.id}`}>
        <div
          className={`rounded-lg bg-white px-4 py-2 ${
            event.isSelected ? "" : "cursor-pointer"
          }`}
        >
          <div className="flex items-center space-x-3">
            {/* Checkbox */}
            {event.isSelected ? (
              <HiCheckCircle className="mb-1 h-6 w-6" />
            ) : (
              <div className="mb-1 h-4 w-4">
                <input
                  type="checkbox"
                  id={`selectEvent-${event.id}`}
                  className="h-4 w-4 cursor-pointer"
                  checked={isChecked}
                  onChange={() => setCheckedEvent(event)}
                />
              </div>
            )}
            {/* Date */}
            <div>
              <div className="text-xs font-medium text-gray-600">
                {format(new Date(event.startDate), "MMMM d (EEEE)")}
              </div>
              <div className="text-xs font-medium text-gray-300">
                {`${format(new Date(event.startDate), "HH:mm")} - ${format(
                  new Date(event.endDate),
                  "HH:mm",
                )} ${getTimeZoneAbv(getPrimaryTimeZone(timeZones))}`}
              </div>
            </div>
          </div>
        </div>
      </label>
    </div>
  );
};
