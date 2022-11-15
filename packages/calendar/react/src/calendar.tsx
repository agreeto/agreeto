import "@agreeto/tailwind-config";
import "@agreeto/ui/dist/styles.css";
import "react-toastify/dist/ReactToastify.css";
import { add, endOfWeek, startOfWeek } from "date-fns";
import ActionPane from "./components/action-pane";
import { useEffect, useState } from "react";
import { ControlBar } from "./components/control-bar";

import CalendarItem from "./components/calendar-item";
import { type CalendarApi } from "@fullcalendar/react";
import ConfirmationPane from "./components/confirmation-pane";
import { type ActionType } from "./components/action-pane/action-pane";

import { type PLATFORM } from "@agreeto/calendar-core";
import { trpc } from "./utils/trpc";
import { useCalendarStore, useEventStore, useTZStore } from "./utils/store";
import { Language, Membership } from "@agreeto/api/types";

type Props = {
  onClose?: () => void;
  renderKey?: number;
  platform?: PLATFORM;
  onPageChange?: (page: string) => void;
  onPrimaryActionClick?: (type: ActionType) => void;
};

const Calendar: React.FC<Props> = ({
  onClose,
  renderKey,
  platform = "web",
  onPageChange,
  onPrimaryActionClick: _primaryActionClick,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [calendarRef, setCalendarRef] = useState<any>();

  // Zustand
  const setFocusedDate = useCalendarStore((s) => s.setFocusedDate);

  const selectedEventGroupId = useEventStore((s) => s.selectedEventGroupId);
  const openPane = useEventStore((s) => s.openPane);

  const setTzDefaults = useTZStore((s) => s.setTimeZoneDefaults);

  const utils = trpc.useContext();
  useEffect(() => {
    // get user from the query cache
    const user = utils.user.me.getData();
    setTzDefaults(user, platform);

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
          setTzDefaults(user, platform);
        }
      });
    }
    // Only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (calendarRef) {
      const calendarApi: CalendarApi = calendarRef.current.getApi();
      setFocusedDate(new Date(calendarApi.view.currentStart));
    }
  }, [calendarRef, setFocusedDate]);

  // Sometimes, resizing of calendar breaks in the page. For this
  // situations we are updating size on every visibility change
  useEffect(() => {
    if (calendarRef) {
      const calendarApi: CalendarApi = calendarRef.current.getApi();
      setTimeout(() => {
        calendarApi.updateSize();
      }, 10);
    }
  }, [renderKey, calendarRef]);

  // FIXME: Maybe we should do this on server - check back when payment stuff is done
  // Verify locale when membership changes
  const { data: user } = trpc.user.me.useQuery();
  const { data: preference } = trpc.preference.byCurrentUser.useQuery();
  const { mutate: updatePreference } = trpc.preference.update.useMutation({
    onSettled() {
      utils.user.me.invalidate();
      utils.preference.byCurrentUser.invalidate();
    },
  });
  useEffect(() => {
    if (user && user.membership === Membership.FREE) {
      preference?.formatLanguage !== Language.EN &&
        updatePreference({
          formatLanguage: Language.EN,
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <div className="flex h-full">
      <div
        className="space-y-4 p-8"
        style={{
          width: openPane ? "calc(100% - 325px)" : "100%",
        }}
      >
        <ControlBar calendarRef={calendarRef} />

        <CalendarItem
          onRefSettled={setCalendarRef}
          onPageChange={onPageChange}
        />
      </div>

      <div
        className="shrink-0"
        style={{
          width: openPane ? "325px" : 0,
        }}
      >
        {openPane === "action" ? (
          <ActionPane onClose={onClose} onPageChange={onPageChange} />
        ) : (
          openPane === "confirmation" &&
          !!selectedEventGroupId && (
            <ConfirmationPane
              onClose={onClose}
              eventGroupId={selectedEventGroupId}
            />
          )
        )}
      </div>
    </div>
  );
};

export default Calendar;
