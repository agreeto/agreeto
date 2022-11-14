import { type FC } from "react";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import {
  convertToDate,
  EventResponseStatus,
  copyToClipboard,
} from "@agreeto/calendar-core";
import Availability from "./availability";
import { Attendees } from "./attendees";
import { IoCloseCircle, IoCheckmarkCircle } from "react-icons/io5";
import { TiArrowSortedDown } from "react-icons/ti";
import { Float } from "@headlessui-float/react";
import OutsideClickHandler from "react-outside-click-handler";
import { Spinner } from "@agreeto/ui";
import { trpc } from "../../utils/trpc";
import { type RouterInputs, type RouterOutputs } from "@agreeto/api";
import { useEventStore } from "../../utils/store";
import clsx from "clsx";

type DirectoryUsers = RouterOutputs["event"]["directoryUsers"];

const actionTypes = {
  "Copy and Close":
    "Copies the selected time slots to your clipboard, then closes the application.",
  "Create Hold and Copy":
    "Creates unconfirmed events in the calendar of each attendee, then copies the selected time slots.",
};
type ActionType = keyof typeof actionTypes;

type Props = {
  onClose?: () => void;
  directoryUsersWithEvents: DirectoryUsers;
  onDirectoryUsersWithEventsChange: (users: DirectoryUsers) => void;
  onPageChange?: (page: string) => void;
  onPrimaryActionClick?: (type: ActionType) => void;
};

const ActionPane: FC<Props> = ({
  onClose,
  directoryUsersWithEvents,
  onDirectoryUsersWithEventsChange,
  onPageChange,
  onPrimaryActionClick,
}) => {
  const utils = trpc.useContext();

  const title = useEventStore((s) => s.title);
  const resetTitle = useEventStore((s) => s.resetTitle);
  const updateTitle = useEventStore((s) => s.updateTitle);

  const selectedSlots = useEventStore((s) => s.selectedSlots);
  const clearSlots = useEventStore((s) => s.clearSlots);

  const [unknownAttendees, setUnknownAttendees] = useState<
    RouterInputs["eventGroup"]["create"]["events"][number]["attendees"]
  >([]);
  const [showActionTypesPopup, setShowActionTypesPopup] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreatingSpinner, setShowCreatingSpinner] = useState(false);

  const [buttonType, setButtonType] = useState<ActionType>("Copy and Close");

  const { data: preference } = trpc.preference.byCurrentUser.useQuery();
  const { mutate: createEventGroup, isLoading: isCreatingEventGroup } =
    trpc.eventGroup.create.useMutation({
      onSuccess() {
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
        clearSlots();
        resetTitle();
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

  const isDisabled =
    isCreating || isCreatingEventGroup || selectedSlots.length === 0;

  const handleClose = () => {
    onClose?.();
  };

  const handleSave = async () => {
    setIsCreating(true);
    setShowCreatingSpinner(true);

    if (buttonType === "Copy and Close") {
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
          setIsCreating(false);
          resetTitle();
          clearSlots();
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
            })),
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
              p.id === "primaryActionPopupContainerContent",
          )
        ) {
          return;
        }
        setShowActionTypesPopup(false);
      }}
    >
      <Float
        className="flex h-full items-stretch"
        show={showActionTypesPopup}
        placement="top-end"
      >
        <button
          id="primaryActionPopupContainerButton"
          className={clsx(
            "flex w-10 items-stretch justify-center rounded-r bg-primary hover:bg-primary/80",
            {
              "bg-[#C0C0C0] hover:bg-[#C0C0C0]": isDisabled,
              "cursor-pointer": !isDisabled,
            },
          )}
          disabled={isDisabled}
          onClick={() => {
            setShowActionTypesPopup(!showActionTypesPopup);
          }}
        >
          <div
            className="flex w-full items-center justify-center border-l border-white"
            style={{ marginTop: "2px", marginBottom: "2px" }}
          >
            <TiArrowSortedDown
              className={clsx("h-6 w-6 text-white", {
                "text-gray-700": isDisabled,
              })}
            />
          </div>
        </button>
        <div
          id="primaryActionPopupContainerContent"
          className="mb-2 rounded border border-[#E3E5E8] bg-white text-left"
          style={{ width: "340px" }}
        >
          {Object.entries(actionTypes).map(([action, description]) => (
            <div
              className="flex cursor-pointer border-b border-[#C2C7CD] py-2 px-4 hover:bg-[#D9D9D9]"
              onClick={() => {
                setButtonType(action as ActionType);
                setShowActionTypesPopup(false);
              }}
            >
              <div className="w-8 shrink-0">
                {buttonType === action && (
                  <IoCheckmarkCircle className="h-6 w-6 text-primary" />
                )}
              </div>
              <div>
                <div
                  className={clsx("text-sm font-semibold text-primary", {
                    "text-gray-700": buttonType !== action,
                  })}
                >
                  {action}
                </div>
                <div className="pt-1 text-xs text-[#767676]">{description}</div>
              </div>
            </div>
          ))}
        </div>
      </Float>
    </OutsideClickHandler>
  );

  return (
    <div className="h-full bg-gray-100 px-10 py-8">
      {/* Loading container */}
      {isCreating && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#ffffff73]">
          {showCreatingSpinner && (
            <div className="h-16 w-16">
              <Spinner />
            </div>
          )}
        </div>
      )}
      <div className="flex h-full flex-col justify-between">
        {/* Top */}
        <div>
          {/* Close icon */}
          {(onClose || true) && (
            <button className="flex justify-end" onClick={handleClose}>
              <IoCloseCircle className="h-8 w-8 cursor-pointer text-red-600" />
            </button>
          )}

          {/* Title input */}
          <div className="flex justify-end pt-8">
            <input
              className="input input-big w-full"
              placeholder="Add a title"
              value={title}
              onChange={(e) => updateTitle(e.target.value)}
            />
          </div>

          {/* Attendees */}
          <div className="pt-8">
            <Attendees
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
            <Availability onPageChange={onPageChange} />
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-4">
          <div className="flex items-stretch">
            <button
              className={clsx(
                "w-full rounded-l bg-primary py-4 text-base font-bold text-white hover:bg-primary/80",
                {
                  "bg-[#C0C0C0] text-gray-700 hover:bg-[#C0C0C0]": isDisabled,
                  "cursor-pointer": !isDisabled,
                },
              )}
              disabled={isDisabled}
              onClick={handleSave}
            >
              {buttonType}
            </button>
            {actionTypesPopup}
          </div>
        </div>
      </div>
      <ToastContainer containerId="toast-container-1" />
    </div>
  );
};

export default ActionPane;
