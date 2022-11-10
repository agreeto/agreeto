import { type FC } from "react";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import closeIcon from "../../assets/close.svg";
import backIcon from "../../assets/double-arrow-left.svg";
import googleMeetIcon from "../../assets/google-meet.svg";
import teamsIcon from "../../assets/ms-teams.svg";
import copyIcon from "../../assets/copy.svg";
import checkMark2Icon from "../../assets/check-mark-2.png";
import Attendees from "./../action-pane/attendees";
import { format } from "date-fns-tz";
import { EventResponseStatus } from "@agreeto/db";
import { convertToSlot, copyToClipboard } from "../../utils/event.helper";
// TODO: This modal should come from `ui` package. I disabled it because we are having trouble with tailwindcss
// on `ext` app when we import the modal from the `ui` package
import { Modal } from "../modal";
import {
  getPrimaryTimeZone,
  getTimeZoneAbv,
} from "../../utils/time-zone.helper";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import { changePane } from "../../redux/view.slice";
import { trpc } from "../../utils/trpc";

type Props = {
  onClose?: () => void;
  eventGroupId: string;
  onSave?: () => void;

  onHoverEvent: (event?: IEvent) => void;
  checkedEvent?: IEvent;

  onEventCheck: (event?: IEvent) => void;
  eventsQuery: IGetEventsQuery;
  directoryUsersWithEvents: IDirectoryUser[];

  onDirectoryUsersWithEventsChange: (users: IDirectoryUser[]) => void;
};

const ConfirmationPane: FC<Props> = ({
  onClose,
  eventGroupId,
  onSave,
  onHoverEvent,
  checkedEvent,
  onEventCheck,
  eventsQuery,
  directoryUsersWithEvents,
  onDirectoryUsersWithEventsChange,
}) => {
  const dispatch = useDispatch();
  const utils = trpc.useContext();

  // Redux
  const { timeZones } = useSelector((state: RootState) => state.timeZone);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [addConference, setAddConference] = useState(false);
  const [title, setTitle] = useState("");
  const [unknownAttendees, setUnknownAttendees] = useState<IAttendee[]>([]);

  useEffect(() => {
    setAddConference(false);
  }, [eventGroupId]);

  const { data: preference } = useGetPreference();
  const { data: accounts } = useGetAccounts();
  const primaryAccount = accounts?.find((a) => a.isPrimary);
  const { data: eventGroup, isLoading: isLoadingGroup } =
    trpc.eventGroup.byId.useQuery(
      { id: eventGroupId },
      {
        onSuccess: (eg) => {
          setTitle(eg.title || "");
        },
      }
    );
  const { mutateAsync: confirmEvent, isLoading: isConfirming } =
    useConfirmEvent();
  const { mutateAsync: deleteEventGroup, isLoading: isDeleting } =
    useDeleteEventGroup();

  const handleClose = () => {
    onClose?.();
  };

  const handleBack = () => {
    dispatch(changePane("action"));
  };

  const handleSave = async () => {
    if (!checkedEvent) {
      return toast("Please select a slot", {
        position: "bottom-center",
        hideProgressBar: true,
        autoClose: 2000,
        type: "error",
      });
    }

    try {
      // Save events to DB
      await confirmEvent({
        eventId: checkedEvent.id,
        body: {
          addConference,
          title,
          attendees: unknownAttendees.concat(
            directoryUsersWithEvents.map((u) => ({
              id: u.id,
              name: u.name,
              surname: u.surname,
              email: u.email,
              provider: u.provider,
              responseStatus: EventResponseStatus.NEEDS_ACTION,
            }))
          ),
        },
      });
      // Trigger refetch on get events
      Promise.all([
        queryClient.invalidateQueries([QUERY_KEY.GET_EVENTS]),
        queryClient.invalidateQueries([QUERY_KEY.GET_EVENT_GROUP]),
      ]);
    } catch (error) {
      toast("Failed to create events", {
        position: "bottom-center",
        hideProgressBar: true,
        autoClose: 2000,
        type: "error",
      });
      return;
    }

    toast("Selected slot is confirmed", {
      position: "bottom-center",
      hideProgressBar: true,
      autoClose: 1000,
      type: "success",
    });
    onSave?.();
  };

  const handleDelete = async () => {
    setShowDeleteModal(false);

    try {
      // Delete event group
      await deleteEventGroup(eventGroupId);
      // Trigger refetch on get events
      await queryClient.invalidateQueries([QUERY_KEY.GET_EVENTS]);
    } catch (error) {
      toast("Failed to delete event group", {
        position: "bottom-center",
        hideProgressBar: true,
        autoClose: 2000,
        type: "error",
      });
      return;
    }

    toast("Event group and its events deleted", {
      position: "bottom-center",
      hideProgressBar: true,
      autoClose: 1000,
      type: "success",
    });

    dispatch(changePane("action"));
  };

  const titleElem = (
    <>
      <div>
        <input
          className="input input-big w-full"
          placeholder="Add a title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          readOnly={eventGroup?.isSelectionDone}
        />
      </div>

      <div className="w-100 flex justify-between mt-4">
        <div>
          <span className="text-sm">
            {!eventGroup?.isSelectionDone ? (
              "Select your slot"
            ) : (
              <div className="pb-1">
                <span className="text-sm">You selected the following slot</span>
              </div>
            )}
          </span>
        </div>

        {/* Copy button */}
        {!eventGroup?.isSelectionDone && (
          <div>
            <button
              className="icon-button w-7 h-7"
              title="copy"
              onClick={() => {
                if (!eventGroup?.events) return;

                copyToClipboard(
                  eventGroup.events?.map((e) => convertToSlot(e)),
                  preference
                );
                toast("Saved to clipboard!", {
                  position: "bottom-center",
                  hideProgressBar: true,
                  autoClose: 1000,
                  type: "info",
                });
              }}
            >
              <img src={copyIcon} alt="copy" className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </>
  );

  const eventsElem = eventGroup?.events
    ?.sort(
      (a, b) =>
        new Date(a.startDate || new Date()).getTime() -
        new Date(b.startDate || new Date()).getTime()
    )
    .map((event) => {
      const { id, startDate = new Date(), endDate = new Date() } = event;

      return (
        <div
          key={id}
          onMouseEnter={() => !event.isSelected && onHoverEvent(event)}
          onMouseLeave={() => !event.isSelected && onHoverEvent(undefined)}
        >
          <label htmlFor={`selectEvent-${id}`}>
            <div
              className={`bg-white px-4 py-2 rounded-lg ${
                event.isSelected ? "" : "cursor-pointer"
              }`}
            >
              <div className="flex space-x-3 items-center">
                {/* Checkbox */}
                {event.isSelected ? (
                  <div className="w-6 h-6 mb-1">
                    <img src={checkMark2Icon} className="w-6 h-6" alt="" />
                  </div>
                ) : (
                  <div className="w-4 h-4 mb-1">
                    <input
                      type="checkbox"
                      id={`selectEvent-${id}`}
                      className="h-4 w-4 cursor-pointer"
                      checked={checkedEvent?.id === event.id}
                      onChange={() => onEventCheck(event)}
                    />
                  </div>
                )}
                {/* Date */}
                <div>
                  <div className="text-xs font-medium color-gray-600">
                    {format(new Date(startDate), "MMMM d (EEEE)")}
                  </div>
                  <div className="text-xs color-gray-300 font-medium">
                    {`${format(new Date(startDate), "HH:mm")} - ${format(
                      new Date(endDate),
                      "HH:mm"
                    )} ${getTimeZoneAbv(getPrimaryTimeZone(timeZones))}`}
                  </div>
                </div>
              </div>
            </div>
          </label>
        </div>
      );
    });

  const conferenceElem = primaryAccount && (
    <div>
      <div className="pt-3">
        <span className="text-sm">Location</span>
      </div>

      <div
        className={`relative mt-2 px-3 py-2 w-100 flex justify-between items-center bg-white rounded-lg ${
          !eventGroup?.createBlocker ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {/* Check icon */}
        {addConference && (
          <div className="absolute -right-2 -top-2">
            <img src={checkMark2Icon} className="w-4 h-4" alt="" />
          </div>
        )}

        {/* Icon and title */}
        <div className="flex items-center">
          {primaryAccount.provider === AccountProvider.GOOGLE ? (
            <>
              <img src={googleMeetIcon} alt="meet" className="w-8 h-8" />
              <span className="pl-3 color-gray-900 font-medium text-sm">
                Google Meet
              </span>
            </>
          ) : (
            <>
              <img src={teamsIcon} alt="teams" className="w-7 h-7" />
              <span className="pl-2 color-gray-900 font-medium text-sm">
                Microsoft Teams
              </span>
            </>
          )}
        </div>

        {/* Button */}
        <div>
          <button
            className="button-outline button-small"
            onClick={() => setAddConference(!addConference)}
            disabled={!eventGroup?.createBlocker}
          >
            {addConference ? "Remove" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );

  const saveButton = (
    <div className="space-y-4">
      {!eventGroup?.isSelectionDone && (
        <button
          className="button w-full"
          onClick={handleSave}
          disabled={!checkedEvent || isConfirming || isDeleting}
        >
          Confirm
        </button>
      )}
      <button
        className="button-borderless button-borderless-danger w-full"
        onClick={() => setShowDeleteModal(true)}
        disabled={isConfirming || isDeleting}
      >
        Delete This Group
      </button>
    </div>
  );

  return (
    <div className="px-10 py-8 h-full bg-gray-100">
      <div className="flex flex-col h-full justify-between">
        {/* Top */}
        <div>
          <div className="flex justify-between items-center">
            {/* Back icon */}
            <div>
              <img
                src={backIcon}
                alt="back"
                className="cursor-pointer w-8 h-8"
                onClick={handleBack}
              />
            </div>

            {/* Close icon */}
            {onClose && (
              <div>
                <img
                  src={closeIcon}
                  alt="close"
                  className="cursor-pointer w-8 h-8"
                  onClick={handleClose}
                />
              </div>
            )}
          </div>

          {/* Some padding */}
          <div className="pt-8" />
          {isLoadingGroup && <div>Loading...</div>}

          {/* Title */}
          <div>{titleElem}</div>

          {/* Events */}
          <div className="pt-1 space-y-4 overflow-auto max-h-56">
            {eventsElem}
          </div>

          {/* Info */}
          {/* <div className="pt-4 leading-none text-center">
            <span className="color-gray-300 font-medium text-2xs-05">
              {!eventGroup?.isSelectionDone &&
                'Once you confirm a slot, other slots will be removed from your actual calendar(s)'}
            </span>
          </div> */}

          {/* Conference */}
          {!eventGroup?.isSelectionDone && (
            <div className="pt-2 overflow-visible">{conferenceElem}</div>
          )}

          {/* Attendees */}
          <div className="pt-4">
            <Attendees
              eventsQuery={eventsQuery}
              unknownAttendees={unknownAttendees}
              onUnknownAttendeesChange={setUnknownAttendees}
              directoryUsersWithEvents={directoryUsersWithEvents}
              onDirectoryUsersWithEventsChange={
                onDirectoryUsersWithEventsChange
              }
              eventGroup={eventGroup}
            />
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-4">{saveButton}</div>
      </div>

      <ToastContainer />

      <Modal
        open={showDeleteModal}
        title="Delete Event Group"
        description="Deleting an event group will also delete all its child events. If you created those events with Create Blocker flag, AgreeTo will attempt to delete them from your actual calendars as well"
        primaryButton={{
          text: "Delete",
          onClick: handleDelete,
          type: "danger",
        }}
        cancelButton={{
          text: "Cancel",
          onClick: () => setShowDeleteModal(false),
        }}
      />
    </div>
  );
};

export default ConfirmationPane;
