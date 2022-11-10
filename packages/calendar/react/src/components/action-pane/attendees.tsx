import debounce from "lodash/debounce";
import uniqBy from "lodash/uniqBy";
import { type FC } from "react";
import { useCallback, useEffect, useState } from "react";
import OutsideClickHandler from "react-outside-click-handler";
import { EventResponseStatus, Membership } from "@agreeto/db";
import searchIcon from "../../assets/search.svg";
import { getNextColor } from "../../utils/color.helper";
import { Spinner } from "../spinner";
import SelectedAttendeeCard from "./selected-attendee-card";
import UnknownAttendeeCard from "./unknown-attendee-card";
import { Float } from "@headlessui-float/react";
import { type RouterInputs, type RouterOutputs, trpc } from "../../utils/trpc";

type Props = {
  eventsQuery: RouterInputs["event"]["all"];
  directoryUsersWithEvents: RouterOutputs["event"]["directoryUsers"];

  onDirectoryUsersWithEventsChange: (
    users: RouterOutputs["event"]["directoryUsers"]
  ) => void;
  unknownAttendees: RouterInputs["eventGroup"]["create"]["events"][number]["attendees"];

  onUnknownAttendeesChange: (
    attendees: RouterInputs["eventGroup"]["create"]["events"][number]["attendees"]
  ) => void;
  eventGroup?: RouterOutputs["eventGroup"]["byId"];

  onPageChange?: (page: string) => void;
};

const Attendees: FC<Props> = ({
  eventsQuery,
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

  const { data: user } = trpc.user.me.useQuery();
  const isFree = user?.membership === Membership.FREE;
  // This params is used to get events of selected directory users
  // startDate and endDate is decided by the calendar's visbile view
  const [directoryUserEventParams, setDirectoryUserEventParams] = useState<
    RouterInputs["event"]["directoryUsers"]
  >({
    users: [],
    startDate: eventsQuery.startDate,
    endDate: eventsQuery.endDate,
  });

  useEffect(() => {
    setDirectoryUserEventParams((p) => ({
      ...p,
      startDate: eventsQuery.startDate,
      endDate: eventsQuery.endDate,
    }));
  }, [eventsQuery]);

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
    onSuccess: (userEvents) => {
      const userEventsWithColors = userEvents.map((u, idx) => ({
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
      enabled: !isFree,
    });

  // This callback is used not to trigger debounce on every attendeeText state changed
  // And yes it works
  const attendeeDebounceCallback = useCallback(
    (value: string) => debouncedAttendeeSearch(value),
    []
  );

  // Debounce the attendee search call to prevent multiple calls
  const debouncedAttendeeSearch = debounce((search) => {
    setAttendeeParams((params) => ({
      ...params,
      search,
    }));
  }, 500);

  const attendeeOptionCard = (
    user: RouterOutputs["user"]["getFriends"][number]
  ) => {
    if (!user) return null;

    const alreadySelected = directoryUserEventParams.users.some(
      (a) => a.id === user.id
    );
    // Do not render if already selected
    if (alreadySelected) return null;

    return (
      <div
        className="text-xs px-3 py-1 cursor-pointer color-gray-600 hover:bg-gray-200"
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
      className="text-xs px-3 py-1 cursor-pointer color-gray-600 hover:bg-gray-200"
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
          uniqBy([...unknownAttendees, newAttendee], "email")
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

      <div className="py-1 space-y-1 max-h-36 overflow-auto">
        {/* Selected attendees */}
        {directoryUsersWithEvents.map((attendee) => (
          <SelectedAttendeeCard
            key={attendee.id}
            attendee={attendee}
            hideDeleteButton={!!eventGroup?.isSelectionDone}
            onDelete={(id) => {
              setDirectoryUserEventParams((params) => ({
                ...params,
                users: [...params.users.filter((a) => a.id !== id)],
              }));
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
                p.id === "attendeePopup" || p.id === "attendeePopupContainer"
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
                <div
                  className="input-icon-after"
                  onClick={() => isFree && setShowProTooltip(true)}
                >
                  <input
                    className="input-outline w-full"
                    disabled={isFree}
                    style={{ backgroundColor: isFree ? "#F0F1F2" : "white" }}
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
                  <div className="input-icon-container">
                    {isLoadingUsers ? (
                      <Spinner />
                    ) : (
                      <img src={searchIcon} alt="info" />
                    )}
                  </div>
                </div>
              </div>
              <div
                className="rounded border border-[#F9FAFA] p-4 w-60 bg-[#F9FAFA] text-left mt-4 cursor-auto"
                style={{ boxShadow: "2px 4px 12px 2px #dbd9d9" }}
              >
                <div className="color-gray-900 font-semibold text-sm">
                  Unlock Other Attendees
                </div>
                <div className="color-gray-900 text-xs mt-2">
                  This feature is part of the Pro Plan
                </div>
                <div
                  className="w-full mt-8 h-8 flex justify-center items-center cursor-pointer border rounded border-primary color-primary cursor-pointer"
                  onClick={() => onPageChange?.("settings")}
                >
                  Upgrade
                </div>
                <Float.Arrow
                  className="absolute bg-[#F9FAFA] w-5 h-5 rotate-45"
                  offset={-12}
                />
              </div>
            </Float>
          )}

          {/* Fetched directory users result */}
          {Boolean(isAttendeePopupOpen && directoryUsers) && (
            <div
              id="attendeePopup"
              className="absolute bg-white py-1 rounded w-full shadow-xl mt-1 z-10"
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

export default Attendees;
