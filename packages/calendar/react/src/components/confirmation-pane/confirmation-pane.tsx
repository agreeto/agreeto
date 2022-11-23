import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";

import { Attendees } from "./../action-pane/attendees";
import { EventResponseStatus } from "@agreeto/api/types";
import { Button, Modal } from "@agreeto/ui";

import { trpc } from "../../utils/trpc";
import { ConferenceElement } from "./conference-element";
import { EventElement } from "./event-element";
import { Title } from "./title";
import { useEventStore } from "../../utils/store";
import { IoClose, IoChevronBackOutline } from "react-icons/io5";

const ConfirmationPane: React.FC<{
  onClose?: () => void;
  // Passed as props here instead of grabbing it from store
  // since we need it to be non-nullable
  eventGroupId: string;
}> = ({ onClose, eventGroupId }) => {
  const utils = trpc.useContext();

  const checkedEvent = useEventStore((s) => s.checkedEvent);
  const directoryUsersWithEvents = useEventStore(
    (s) => s.directoryUsersWithEvents,
  );
  const unknownAttendees = useEventStore((s) => s.unknownAttendees);

  const changePane = useEventStore((s) => s.changePane);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [addConference, setAddConference] = useState(false);
  const [title, setTitle] = useState("");

  useEffect(() => {
    setAddConference(false);
  }, [eventGroupId]);

  const { data: accounts } = trpc.account.me.useQuery();
  const primaryAccount = accounts?.find((a) => a.userIdPrimary);

  const { data: eventGroup } = trpc.eventGroup.byId.useQuery(
    { id: eventGroupId },
    {
      onSuccess: (eg) => {
        setTitle(eg.title || "");
      },
    },
  );

  const { mutate: confirmEvent, isLoading: isConfirming } =
    trpc.event.confirm.useMutation({
      onSuccess() {
        utils.event.all.invalidate();
        utils.eventGroup.byId.invalidate({ id: eventGroupId });
        toast("Selected slot is confirmed", {
          position: "bottom-center",
          hideProgressBar: true,
          autoClose: 1000,
          type: "success",
        });
      },
      onError() {
        toast("Failed to create events", {
          position: "bottom-center",
          hideProgressBar: true,
          autoClose: 2000,
          type: "error",
        });
      },
    });

  const { mutate: deleteEventGroup, isLoading: isDeleting } =
    trpc.eventGroup.delete.useMutation({
      onSuccess() {
        utils.event.all.invalidate();
        toast("Event group and its events deleted", {
          position: "bottom-center",
          hideProgressBar: true,
          autoClose: 1000,
          type: "success",
        });
        changePane("action");
      },
      onError() {
        toast("Failed to delete event group", {
          position: "bottom-center",
          hideProgressBar: true,
          autoClose: 2000,
          type: "error",
        });
      },
    });

  const handleSave = async () => {
    if (!checkedEvent || !checkedEvent.id) {
      toast("Please select a slot", {
        position: "bottom-center",
        hideProgressBar: true,
        autoClose: 2000,
        type: "error",
      });
      return;
    }

    // Save events to DB
    confirmEvent({
      id: checkedEvent.id,
      addConference,
      title,
      attendees: unknownAttendees.concat(
        directoryUsersWithEvents.map((u) => ({
          id: u.id,
          color: u.color,
          name: u.name,
          surname: u.surname,
          email: u.email,
          provider: u.provider,
          responseStatus: EventResponseStatus.NEEDS_ACTION,
        })),
      ),
    });
  };

  const handleDelete = async () => {
    setShowDeleteModal(false);
    deleteEventGroup({ id: eventGroupId });
  };

  return (
    <div className="h-full px-10 py-8 bg-gray-100">
      <div className="flex flex-col justify-between h-full">
        {/* Top */}
        <div>
          <div className="flex justify-between flex-1">
            {/* Back icon */}
            <button
              className="p-1 rounded cursor-pointer hover:bg-gray-200"
              onClick={() => changePane("action")}
            >
              <IoChevronBackOutline className="w-6 h-6 text-neutral" />
            </button>

            {/* Close icon */}
            {(onClose || true) && (
              <button
                className="p-1 bg-red-500 rounded cursor-pointer hover:bg-red-600"
                onClick={() => onClose?.()}
              >
                <IoClose className="w-6 h-6 text-white" />
              </button>
            )}
          </div>

          {/* Title */}
          <Title
            {...{
              title,
              setTitle,
              events: eventGroup?.events,
              isSelectionDone: !!eventGroup?.isSelectionDone,
            }}
          />

          {/* Events */}
          <div className="pt-1 space-y-4 overflow-auto max-h-56">
            {eventGroup?.events
              ?.sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
              .map((event) => (
                <EventElement key={event.id} event={event} />
              ))}
          </div>

          {/* Info */}
          {/* <div className="pt-4 leading-none text-center">
            <span className="font-medium text-gray-300 text-2xs-05">
              {!eventGroup?.isSelectionDone &&
                'Once you confirm a slot, other slots will be removed from your actual calendar(s)'}
            </span>
          </div> */}

          {/* Conference */}
          {eventGroup && !eventGroup.isSelectionDone && primaryAccount && (
            <div className="pt-2 overflow-visible">
              <ConferenceElement
                {...{
                  eventGroup,
                  addConference,
                  setAddConference,
                  provider: primaryAccount.provider,
                }}
              />
            </div>
          )}

          {/* Attendees */}
          <div className="pt-4">
            <Attendees eventGroup={eventGroup} />
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-4">
          {/* Save */}
          <div className="space-y-4">
            {!eventGroup?.isSelectionDone && (
              <Button
                className="w-full"
                onClick={handleSave}
                disabled={!checkedEvent || isConfirming || isDeleting}
              >
                Confirm
              </Button>
            )}
            <Button
              variant="glass"
              className="w-full text-red-600"
              onClick={() => setShowDeleteModal(true)}
              disabled={isConfirming || isDeleting}
            >
              Delete This Group
            </Button>
          </div>
        </div>
        {/* End Save */}
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
