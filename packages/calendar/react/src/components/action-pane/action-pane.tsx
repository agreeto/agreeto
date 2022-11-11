import { type ChangeEventHandler, type FC } from "react";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import closeIcon from "../../assets/close.svg";
import { type EventInput } from "@fullcalendar/react";
import { convertToDate } from "../../utils/date.helper";
import { EventResponseStatus } from "@agreeto/db";
import { copyToClipboard } from "../../utils/event.helper";
import Availability from "./availability";
import { Attendees } from "./attendees";
import { PRIMARY_ACTION_TYPES } from "../../utils/enums";
import sortDownIcon from "../../assets/sort-down.png";
import sortDownGrayIcon from "../../assets/sort-down-gray.png";
import checkmarkBlueIcon from "../../assets/check-mark-blue-2.svg";
import { Float } from "@headlessui-float/react";
import OutsideClickHandler from "react-outside-click-handler";
import { Spinner } from "../spinner";
import { type RouterInputs, trpc, type RouterOutputs } from "../../utils/trpc";

type CreatedEventGroup = RouterOutputs["eventGroup"]["create"];
type DirectoryUsers = RouterOutputs["event"]["directoryUsers"];

type Props = {
  onClose?: () => void;
  selectedSlots: EventInput[];
  onSelectedSlotDelete: (slot: EventInput) => void;
  title: string;
  onTitleChange: ChangeEventHandler<HTMLInputElement>;
  onSave?: (events: CreatedEventGroup) => void;
  onCopyAndClose?: () => void;
  eventsQuery: RouterInputs["event"]["all"];
  directoryUsersWithEvents: DirectoryUsers;
  onDirectoryUsersWithEventsChange: (users: DirectoryUsers) => void;
  onPageChange?: (page: string) => void;
  onPrimaryActionClick?: (type: PRIMARY_ACTION_TYPES) => void;
};

const ActionPane: FC<Props> = ({
  onClose,
  selectedSlots,
  onSelectedSlotDelete,
  title,
  onTitleChange,
  onSave,
  onCopyAndClose,
  eventsQuery,
  directoryUsersWithEvents,
  onDirectoryUsersWithEventsChange,
  onPageChange,
  onPrimaryActionClick,
}) => {
  const utils = trpc.useContext();
  const [unknownAttendees, setUnknownAttendees] = useState<
    RouterInputs["eventGroup"]["create"]["events"][number]["attendees"]
  >([]);
  const [showActionTypesPopup, setShowActionTypesPopup] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showCreatingSpinner, setShowCreatingSpinner] = useState(false);

  const [buttonType, setButtonType] = useState(
    PRIMARY_ACTION_TYPES.COPY_AND_CLOSE
  );

  const { data: preference } = trpc.preference.byCurrentUser.useQuery();
  const { mutate: createEventGroup, isLoading: isCreatingEventGroup } =
    trpc.eventGroup.create.useMutation({
      onSuccess(eventGroup) {
        setUnknownAttendees([]);
        utils.event.all.invalidate();

        copyToClipboard(selectedSlots, preference);
        toast("Saved and copied to clipboard!", {
          position: "bottom-center",
          hideProgressBar: true,
          autoClose: 1000,
          type: "success",
        });
        setIsCreating(false);
        onSave?.(eventGroup);
      },
      onError() {
        toast("Failed to create events", {
          position: "bottom-center",
          hideProgressBar: true,
          autoClose: 2000,
          type: "error",
        });
        setIsCreating(false);
      },
    });

  const handleClose = () => {
    onClose?.();
  };

  const handleSave = async () => {
    setIsCreating(true);
    setShowCreatingSpinner(true);
    setShowTooltip(true);

    if (buttonType === PRIMARY_ACTION_TYPES.COPY_AND_CLOSE) {
      setTimeout(() => {
        copyToClipboard(selectedSlots, preference);
        toast("Saved and copied to clipboard!", {
          position: "bottom-center",
          hideProgressBar: true,
          type: "success",
          delay: 0,
        });
        setShowCreatingSpinner(false);

        setTimeout(() => {
          setShowTooltip(false);
          setIsCreating(false);
          onCopyAndClose?.();
        }, 1000);
        onPrimaryActionClick?.(buttonType);
      }, 500);
      return;
    }

    // Save events

    // Create events in real calendars
    createEventGroup({
      createBlocker: true,
      title: selectedSlots[0]?.title || "",
      events: selectedSlots.map((slot) => {
        if (!slot.start || !slot.end) {
          throw new Error("Please select a correct slot");
        }
        return {
          title: slot.title || "",
          startDate: convertToDate(slot.start),
          endDate: convertToDate(slot.end),
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
        };
      }),
    });
  };

  const actionTypesPopup = (
    <OutsideClickHandler
      onOutsideClick={(e: any) => {
        // This check is put here to prevent unexpexted closes in the extension
        if (
          e.path?.find(
            (p: any) =>
              p.id === "primaryActionPopupContainerButton" ||
              p.id === "primaryActionPopupContainerContent"
          )
        ) {
          return;
        }
        setShowActionTypesPopup(false);
      }}
    >
      <Float
        className="flex items-stretch h-full"
        show={showActionTypesPopup}
        placement="top-end"
      >
        <div
          id="primaryActionPopupContainerButton"
          className={`flex items-stretch justify-center w-10 rounded-r ${
            selectedSlots.length === 0 || isCreatingEventGroup
              ? "bg-[#C0C0C0] cursor-not-allowed"
              : "bg-primary cursor-pointer"
          }`}
          onClick={() => {
            if (selectedSlots.length === 0 || isCreatingEventGroup) return;
            setShowActionTypesPopup(!showActionTypesPopup);
          }}
        >
          <div
            className="border-l border-white w-full flex justify-center items-center"
            style={{ marginTop: "2px", marginBottom: "2px" }}
          >
            <img
              src={
                selectedSlots.length === 0 || isCreatingEventGroup
                  ? sortDownGrayIcon
                  : sortDownIcon
              }
              width={15}
              height={15}
              alt="sort down"
            />
          </div>
        </div>
        <div
          id="primaryActionPopupContainerContent"
          className="rounded border border-[#E3E5E8] bg-white text-left mb-2"
          style={{ width: "340px" }}
        >
          {/* Copy and Close */}
          <div
            className="flex py-2 px-4 hover:bg-[#D9D9D9] cursor-pointer border-b border-[#C2C7CD]"
            onClick={() => {
              setButtonType(PRIMARY_ACTION_TYPES.COPY_AND_CLOSE);
              setShowActionTypesPopup(false);
            }}
          >
            <div className="w-8 shrink-0">
              {buttonType === PRIMARY_ACTION_TYPES.COPY_AND_CLOSE && (
                <img src={checkmarkBlueIcon} width={20} alt="" />
              )}
            </div>
            <div>
              <div
                className={`text-sm font-semibold ${
                  buttonType === PRIMARY_ACTION_TYPES.COPY_AND_CLOSE
                    ? "color-primary"
                    : "color-[#3A3F46]"
                }`}
              >
                Copy and Close
              </div>
              <div className="text-xs text-[#767676] pt-1">
                Copies the selected time slots to your clipboard, then closes
                the application.
              </div>
            </div>
          </div>
          {/* Create Hold and Copy */}
          <div
            className="flex py-2 px-4 hover:bg-[#D9D9D9] cursor-pointer"
            onClick={() => {
              setButtonType(PRIMARY_ACTION_TYPES.CREATE_HOLD_AND_COPY);
              setShowActionTypesPopup(false);
            }}
          >
            <div className="w-8 shrink-0">
              {buttonType === PRIMARY_ACTION_TYPES.CREATE_HOLD_AND_COPY && (
                <img src={checkmarkBlueIcon} width={20} alt="" />
              )}
            </div>
            <div>
              <div
                className={`text-sm font-semibold ${
                  buttonType === PRIMARY_ACTION_TYPES.CREATE_HOLD_AND_COPY
                    ? "color-primary"
                    : "color-[#3A3F46]"
                }`}
              >
                Create Hold and Copy
              </div>
              <div className="text-xs text-[#767676] pt-1">
                Creates unconfirmed events in the calendar of each attendee,
                then copies the selected time slots.
              </div>
            </div>
          </div>
        </div>
      </Float>
    </OutsideClickHandler>
  );

  return (
    <div className="px-10 py-8 h-full bg-gray-100">
      {/* Loading container */}
      {isCreating && (
        <div className="absolute inset-0 z-10 flex justify-center items-center bg-[#ffffff73]">
          {showCreatingSpinner && (
            <Spinner style={{ width: "70px", height: "70px" }} />
          )}
        </div>
      )}

      <div className="flex flex-col h-full justify-between">
        {/* Top */}
        <div>
          {/* Close icon */}
          {onClose && (
            <div className="flex justify-end">
              <img
                src={closeIcon}
                alt="close"
                className="cursor-pointer w-8 h-8"
                onClick={handleClose}
              />
            </div>
          )}

          {/* Title input */}
          <div className="pt-8 flex justify-end">
            <input
              className="input input-big w-full"
              placeholder="Add a title"
              value={title}
              onChange={onTitleChange}
            />
          </div>

          {/* Attendees */}
          <div className="pt-8">
            <Attendees
              eventsQuery={eventsQuery}
              unknownAttendees={unknownAttendees}
              onUnknownAttendeesChange={setUnknownAttendees}
              directoryUsersWithEvents={directoryUsersWithEvents}
              onDirectoryUsersWithEventsChange={
                onDirectoryUsersWithEventsChange
              }
              onPageChange={onPageChange}
            />
          </div>

          {/* Availability */}
          <div className="pt-8">
            <Availability
              selectedSlots={selectedSlots}
              onDelete={(event) => onSelectedSlotDelete(event)}
              onPageChange={onPageChange}
            />
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-4">
          <div className="flex items-stretch">
            <button
              className="button w-full"
              disabled={selectedSlots.length === 0 || isCreatingEventGroup}
              onClick={handleSave}
              style={{
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
              }}
            >
              {buttonType === PRIMARY_ACTION_TYPES.CREATE_HOLD_AND_COPY
                ? "Create Hold and Copy"
                : "Copy and Close"}
            </button>
            {actionTypesPopup}
          </div>
        </div>
      </div>
      {showTooltip && <ToastContainer containerId="toast-container-1" />}
    </div>
  );
};

export default ActionPane;
