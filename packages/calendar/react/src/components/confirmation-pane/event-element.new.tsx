import React from "react";
import { type RouterOutputs } from "@agreeto/api";
import checkMark2Icon from "../../assets/check-mark-2.png";
import { format } from "date-fns-tz";
import { getPrimaryTimeZone, getTimeZoneAbv } from "@agreeto/calendar-core";
import { useStore } from "../../utils/store";

type EventGroupEvent = RouterOutputs["eventGroup"]["byId"]["events"][number];

export const EventElement: React.FC<{
  event: EventGroupEvent;
  onHover: (event: EventGroupEvent | undefined) => void;
  isChecked: boolean;
  onCheck: (event: EventGroupEvent) => void;
}> = ({ event, onHover, isChecked, onCheck }) => {
  const timeZones = useStore((s) => s.timeZones);

  return (
    <div
      key={event.id}
      onMouseEnter={() => !event.isSelected && onHover(event)}
      onMouseLeave={() => !event.isSelected && onHover(undefined)}
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
              <div className="mb-1 h-6 w-6">
                <img src={checkMark2Icon} className="h-6 w-6" alt="" />
              </div>
            ) : (
              <div className="mb-1 h-4 w-4">
                <input
                  type="checkbox"
                  id={`selectEvent-${event.id}`}
                  className="h-4 w-4 cursor-pointer"
                  checked={isChecked}
                  onChange={() => onCheck(event)}
                />
              </div>
            )}
            {/* Date */}
            <div>
              <div className="color-gray-600 text-xs font-medium">
                {format(new Date(event.startDate), "MMMM d (EEEE)")}
              </div>
              <div className="color-gray-300 text-xs font-medium">
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
