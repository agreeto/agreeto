import debounce from "lodash/debounce";
import uniqBy from "lodash/uniqBy";
import { type FC } from "react";
import { useCallback, useEffect, useState } from "react";
import OutsideClickHandler from "react-outside-click-handler";
import {
  EventResponseStatus,
  getNextColor,
  Membership,
} from "@agreeto/calendar-core";
import { Spinner } from "@agreeto/ui";
import { AiOutlineSearch } from "react-icons/ai";
import { SelectedAttendeeCard } from "./selected-attendee-card";
import { UnknownAttendeeCard } from "./unknown-attendee-card";
import { Float } from "@headlessui-float/react";
import { trpc } from "../../utils/trpc";
import { type RouterInputs, type RouterOutputs } from "@agreeto/api";
import { useEventStore } from "../../utils/store";
import clsx from "clsx";

type Props = {
  directoryUsersWithEvents: RouterOutputs["event"]["directoryUsers"];

  onDirectoryUsersWithEventsChange: (
    users: RouterOutputs["event"]["directoryUsers"],
  ) => void;
  unknownAttendees: RouterInputs["eventGroup"]["create"]["events"][number]["attendees"];

  onUnknownAttendeesChange: (
    attendees: RouterInputs["eventGroup"]["create"]["events"][number]["attendees"],
  ) => void;
  eventGroup?: RouterOutputs["eventGroup"]["byId"];

  onPageChange?: (page: string) => void;
};

export const Attendees: FC<Props> = ({
  directoryUsersWithEvents,
  onDirectoryUsersWithEventsChange,
  unknownAttendees,
  onUnknownAttendeesChange,
  eventGroup,
  onPageChange,
}) => {
  const [showProTooltip, setShowProTooltip] = useState(false);
  const [isAttendeePopupOpen, setIsAttendeePopupOpen] = useState(false);
  // Attendee text is used to add attendees manually
  const [attendeeText, setAttendeeText] = useState("");
  // Directory users fetch params
  const [attendeeParams, setAttendeeParams] = useState<
    RouterInputs["user"]["getFriends"]
  >({
    search: "",
  });

  const period = useEventStore((s) => s.period);

  const { data: user } = trpc.user.me.useQuery();
  const isFree = user?.membership === Membership.FREE;
  // This params is used to get events of selected directory users
  // startDate and endDate is decided by the calendar's visbile view
  const [directoryUserEventParams, setDirectoryUserEventParams] = useState<
    RouterInputs["event"]["directoryUsers"]
  >({
    users: [],
    startDate: period.startDate,
    endDate: period.endDate,
  });

  useEffect(() => {
    setDirectoryUserEventParams((p) => ({
      ...p,
      startDate: period.startDate,
      endDate: period.endDate,
    }));
  }, [period]);

  useEffect(() => {
    if (!eventGroup || !eventGroup.events?.[0]) return;

    const users = eventGroup.events[0].attendees;
    setDirectoryUserEventParams((params) => ({
      ...params,
      users,
    }));
    onUnknownAttendeesChange([]);
  }, [eventGroup]);

  // Get directory users with events and then assign color to each
  trpc.event.directoryUsers.useQuery(directoryUserEventParams, {
    keepPreviousData: true,
    enabled: !isFree,
    onSuccess: (data) => {
      const userEventsWithColors = data.map((u, idx) => ({
        ...u,
        color: getNextColor(idx),
      }));
      onDirectoryUsersWithEventsChange(userEventsWithColors);
    },
  });
  // Fetch directory users from providers
  const { data: directoryUsers, isFetching: isLoadingUsers } =
    trpc.user.getFriends.useQuery(attendeeParams, {
      keepPreviousData: true,
      staleTime: 60 * 1000,
      enabled: !isFree && attendeeParams.search.length > 0,
    });

  // Debounce the attendee search call to prevent multiple calls
  const debouncedAttendeeSearch = debounce((search) => {
    setAttendeeParams((params) => ({
      ...params,
      search,
    }));
  }, 500);

  // This callback is used not to trigger debounce on every attendeeText state changed
  // And yes it works
  const attendeeDebounceCallback = useCallback(
    (value: string) => debouncedAttendeeSearch(value),
    [],
  );

  const attendeeOptionCard = (
    user: RouterOutputs["user"]["getFriends"][number],
  ) => {
    if (!user) return null;

    const alreadySelected = directoryUserEventParams.users.some(
      (a) => a.id === user.id,
    );
    // Do not render if already selected
    if (alreadySelected) return null;

    return (
      <div
        className="color-gray-600 cursor-pointer px-3 py-1 text-xs hover:bg-gray-200"
        key={user.id}
        onClick={() => {
          setDirectoryUserEventParams((params) => ({
            ...params,
            users: [...params.users, user],
          }));
          setIsAttendeePopupOpen(false);
          setAttendeeText("");
          setAttendeeParams({ search: "" });
        }}
      >
        {user.email}
      </div>
    );
  };

  const addUnknownAttendee = (
    <div
      className="color-gray-600 cursor-pointer px-3 py-1 text-xs hover:bg-gray-200"
      onClick={() => {
        const newAttendee = {
          id: attendeeText,
          name: attendeeText,
          surname: "",
          email: attendeeText,
          provider: "google",
          responseStatus: EventResponseStatus.NEEDS_ACTION,
        };
        onUnknownAttendeesChange(
          uniqBy([...unknownAttendees, newAttendee], "email"),
        );
        setAttendeeText("");
        setAttendeeParams((params) => ({
          ...params,
          search: "",
        }));
      }}
    >
      + Add {attendeeText}
    </div>
  );

  return (
    <div className="relative">
      {/* Title */}
      <div>
        <span className="text-sm">
          {!eventGroup?.isSelectionDone ? "Add attendees" : "Attendees"}
        </span>
      </div>

      <div className="max-h-36 space-y-1 overflow-auto py-1">
        {/* Selected attendees */}
        {directoryUsersWithEvents.map((attendee) => (
          <SelectedAttendeeCard
            {...{
              key: attendee.id,
              id: attendee.id,
              color: "red", // FIXME: Where does this come from?
              email: attendee.email,
              hideDeleteButton: !!eventGroup?.isSelectionDone,
              onDelete(id) {
                setDirectoryUserEventParams((params) => ({
                  ...params,
                  users: [...params.users.filter((a) => a.id !== id)],
                }));
              },
            }}
          />
        ))}

        {/* Unknown attendees */}
        {unknownAttendees.map(({ email }) => (
          <UnknownAttendeeCard
            key={email}
            email={email}
            onDelete={(email) => {
              onUnknownAttendeesChange([
                ...unknownAttendees.filter((e) => e.email !== email),
              ]);
            }}
          />
        ))}
      </div>

      {/* Input */}
      <OutsideClickHandler
        onOutsideClick={(e: any) => {
          // This check is put here to prevent unexpexted closes in the extension
          if (
            e.path?.find(
              (p: any) =>
                p.id === "attendeePopup" || p.id === "attendeePopupContainer",
            )
          ) {
            return;
          }
          setIsAttendeePopupOpen(false);
        }}
      >
        <div
          id="attendeePopupContainer"
          onMouseLeave={() => setShowProTooltip(false)}
        >
          {/* Input */}
          {!eventGroup?.isSelectionDone && (
            <Float
              show={isFree && showProTooltip}
              arrow
              flip
              className="cursor-auto"
            >
              <div>
                <label
                  onClick={() => isFree && setShowProTooltip(true)}
                  className="relative flex h-8 w-full items-center justify-end rounded-sm px-1"
                >
                  <input
                    className={clsx(
                      "box-border h-full w-full appearance-none rounded border border-transparent px-1 outline-none hover:border-primary",
                      {
                        "bg-gray-100": isFree,
                      },
                    )}
                    disabled={isFree}
                    placeholder="Search for people"
                    onFocus={() => setIsAttendeePopupOpen(true)}
                    // onKeyDown={(e) => {
                    //   if (e.key === 'Enter') {
                    //     console.log('do validate')
                    //   }
                    // }}
                    onChange={(e) => {
                      attendeeDebounceCallback(e.target.value);
                      setAttendeeText(e.target.value);
                    }}
                    value={attendeeText}
                  />
                  <div className="absolute mr-2 h-4 w-4">
                    {isLoadingUsers ? (
                      <Spinner />
                    ) : (
                      <AiOutlineSearch className="h-4 w-4" />
                    )}
                  </div>
                </label>
              </div>
              <div
                className="mt-4 w-60 cursor-auto rounded border border-[#F9FAFA] bg-[#F9FAFA] p-4 text-left"
                style={{ boxShadow: "2px 4px 12px 2px #dbd9d9" }}
              >
                <div className="color-gray-900 text-sm font-semibold">
                  Unlock Other Attendees
                </div>
                <div className="color-gray-900 mt-2 text-xs">
                  This feature is part of the Pro Plan
                </div>
                <div
                  className="color-primary mt-8 flex h-8 w-full cursor-pointer items-center justify-center rounded border border-primary"
                  onClick={() => onPageChange?.("settings")}
                >
                  Upgrade
                </div>
                <Float.Arrow
                  className="absolute h-5 w-5 rotate-45 bg-[#F9FAFA]"
                  offset={-12}
                />
              </div>
            </Float>
          )}

          {/* Fetched directory users result */}
          {Boolean(isAttendeePopupOpen && directoryUsers) && (
            <div
              id="attendeePopup"
              className="absolute z-10 mt-1 w-full rounded bg-white py-1 shadow-xl"
            >
              <>
                {attendeeText && addUnknownAttendee}
                {directoryUsers?.map((user) => attendeeOptionCard(user))}
              </>
            </div>
          )}
        </div>
      </OutsideClickHandler>
    </div>
  );
};
