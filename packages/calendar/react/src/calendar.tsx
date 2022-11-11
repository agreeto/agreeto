import "@agreeto/tailwind-config";
import "react-toastify/dist/ReactToastify.css";
import { add, endOfWeek, startOfWeek } from "date-fns";
import ActionPane from "./components/action-pane";
import { useEffect, useState } from "react";
import ControlBar, { type CalendarType } from "./components/control-bar";

import CalendarItem from "./components/calendar-item";
import { type CalendarApi, type EventInput } from "@fullcalendar/react";
import ConfirmationPane from "./components/confirmation-pane";
import { ulid } from "ulid";
import { Provider, useSelector } from "react-redux";
import { type RootState, store, useAppDispatch } from "./redux/store";
import { changePane } from "./redux/view.slice";
import { setTimeZoneDefaults } from "./redux/time-zone.slice";
import { type PLATFORM } from "./utils/constants";
import { type PRIMARY_ACTION_TYPES } from "./utils/enums";
import { type RouterOutputs, trpc } from "./utils/trpc";

type Props = {
  onClose?: () => void;
  renderKey?: number;
  platform?: PLATFORM;
  onPageChange?: (page: string) => void;
  onPrimaryActionClick?: (type: PRIMARY_ACTION_TYPES) => void;
};

type EventGroupEvent = RouterOutputs["eventGroup"]["byId"]["events"][number];
type DirectoryUser = RouterOutputs["event"]["directoryUsers"][number];

const Content: React.FC<Props> = ({
  onClose,
  renderKey,
  platform = "web",
  onPageChange,
  onPrimaryActionClick,
}) => {
  const dispatch = useAppDispatch();
  const utils = trpc.useContext();

  // Redux
  const { openPane } = useSelector((state: RootState) => state.view);

  const [eventsQuery, setEventsQuery] = useState({
    startDate: startOfWeek(new Date()),
    endDate: endOfWeek(new Date()),
  });
  const [focusedDate, setFocusedDate] = useState(new Date());
  const [weekends, setWeekends] = useState(false);
  const [title, setTitle] = useState("Blocker: ");
  const [calendarRef, setCalendarRef] = useState<any>();
  const [selectedSlots, setSelectedSlots] = useState([] as EventInput[]);
  const [checkedEvent, setCheckedEvent] = useState<EventGroupEvent>();
  const [selectedEventGroupId, setSelectedEventGroupId] = useState<string>();
  const [hoveredEvent, setHoveredEvent] = useState<EventGroupEvent>();
  const [directoryUsersWithEvents, setDirectoryUsersWithEvents] = useState<
    DirectoryUser[]
  >([]);

  const { data: events, isFetching: isFetchingEvents } =
    trpc.event.all.useQuery(eventsQuery, { staleTime: 30 * 1000 });

  useEffect(() => {
    dispatch(setTimeZoneDefaults({ platform, user: utils.user.me.getData() }));

    // Prefetch next week data
    utils.event.all.prefetch({
      startDate: startOfWeek(add(new Date(), { weeks: 1 })),
      endDate: endOfWeek(add(new Date(), { weeks: 1 })),
    });

    if (platform === "ext") {
      chrome.storage.onChanged.addListener((changes) => {
        // If time zone changes on another tab, then update
        if (
          changes.timeZones ||
          changes.recentlyUsedTimeZones ||
          changes.selectedTimeZone
        ) {
          dispatch(
            setTimeZoneDefaults({ platform, user: utils.user.me.getData() })
          );
        }
      });
    }
  }, []);

  useEffect(() => {
    if (calendarRef) {
      const calendarApi: CalendarApi = calendarRef.current.getApi();
      setFocusedDate(new Date(calendarApi.view.currentStart));
    }
  }, [calendarRef]);

  useEffect(() => {
    if (selectedSlots.length > 0) {
      dispatch(changePane("action"));
    }
  }, [selectedSlots]);

  // Unselect the eventGroupId when the confirmation pane is closed
  useEffect(() => {
    if (openPane !== "confirmation") {
      setSelectedEventGroupId(undefined);
    }
  }, [openPane]);

  // Sometimes, resizing of calendar breaks in the page. For this
  // situations we are updating size on every visibility change
  useEffect(() => {
    if (calendarRef) {
      const calendarApi: CalendarApi = calendarRef.current.getApi();
      setTimeout(() => {
        calendarApi.updateSize();
      }, 10);
    }
  }, [renderKey]);

  const handleDateChange = (action: "prev" | "next" | "today") => {
    const calendarApi: CalendarApi = calendarRef.current.getApi();
    calendarApi[action]();
    const date = calendarApi.getDate();
    setFocusedDate(new Date(calendarApi.view.currentStart));
    setEventsQuery({
      startDate: startOfWeek(date),
      endDate: endOfWeek(date),
    });
  };

  const handleCalendarTypeChange = (type: CalendarType) => {
    setWeekends(type == "7 days");
  };

  const handleSelectedSlotDelete = (slot: EventInput) => {
    setSelectedSlots(selectedSlots.filter((sd) => sd.id !== slot.id));
  };

  const handleSlotSelect = (slot: EventInput) => {
    setSelectedSlots([...selectedSlots, slot]);
  };

  const handleTitleChange = (e: any) => {
    const text = e.target.value;
    setTitle(text);

    setSelectedSlots(
      [...selectedSlots].map((slot) => ({
        ...slot,
        title: text,
      }))
    );
  };

  const handleSlotUpdate = (event: EventInput) => {
    if (event.extendedProps?.new) {
      const newSlots = [...selectedSlots].map((slot) =>
        slot.id !== event.id
          ? slot
          : {
              ...slot,
              start: event.start,
              end: event.end,
              id: ulid(),
            }
      );
      setSelectedSlots(newSlots);
    }
  };

  return (
    <div className="flex h-full">
      <div
        className="p-8"
        style={{
          width: openPane ? "calc(100% - 325px)" : "100%",
        }}
      >
        <div className="w-full pb-4">
          <ControlBar
            date={focusedDate}
            onPrevious={() => handleDateChange("prev")}
            onNext={() => handleDateChange("next")}
            onToday={() => handleDateChange("today")}
            onCalendarTypeChange={handleCalendarTypeChange}
          />
        </div>

        <div className={`w-full ${isFetchingEvents ? "animate-pulse" : ""}`}>
          <CalendarItem
            referenceDate={focusedDate}
            events={events}
            weekends={weekends}
            onRefSettled={setCalendarRef}
            selectedSlots={selectedSlots}
            onSelect={handleSlotSelect}
            onSelectedSlotDelete={handleSelectedSlotDelete}
            title={title}
            hoveredEvent={hoveredEvent}
            onSlotUpdate={handleSlotUpdate}
            directoryUsersWithEvents={directoryUsersWithEvents}
            selectedEventGroupId={selectedEventGroupId}
            onPageChange={onPageChange}
            onEventClick={({ event }) => {
              if (event.extendedProps.isAgreeToEvent) {
                setSelectedEventGroupId(event.extendedProps?.eventGroupId);
                setCheckedEvent(event.extendedProps?.event);
                dispatch(changePane("confirmation"));
              }
            }}
          />
        </div>
      </div>

      <div
        className="shrink-0"
        style={{
          width: openPane ? "325px" : 0,
        }}
      >
        {openPane === "action" ? (
          <ActionPane
            selectedSlots={selectedSlots}
            onClose={onClose}
            eventsQuery={eventsQuery}
            onSelectedSlotDelete={handleSelectedSlotDelete}
            onTitleChange={handleTitleChange}
            title={title}
            directoryUsersWithEvents={directoryUsersWithEvents}
            onDirectoryUsersWithEventsChange={setDirectoryUsersWithEvents}
            onPageChange={onPageChange}
            onPrimaryActionClick={onPrimaryActionClick}
            onSave={() => {
              setSelectedSlots([]);
              setTitle("Blocker: ");
            }}
            onCopyAndClose={() => {
              setSelectedSlots([]);
              setTitle("Blocker: ");
            }}
          />
        ) : (
          openPane === "confirmation" &&
          !!selectedEventGroupId && (
            <ConfirmationPane
              eventGroupId={selectedEventGroupId}
              onClose={onClose}
              onHoverEvent={setHoveredEvent}
              checkedEvent={checkedEvent as any}
              onEventCheck={setCheckedEvent}
              eventsQuery={eventsQuery}
              directoryUsersWithEvents={directoryUsersWithEvents}
              onDirectoryUsersWithEventsChange={setDirectoryUsersWithEvents}
            />
          )
        )}
      </div>
    </div>
  );
};

export default function Calendar(props: Props) {
  return (
    <Provider store={store}>
      <Content {...props} />
    </Provider>
  );
}
