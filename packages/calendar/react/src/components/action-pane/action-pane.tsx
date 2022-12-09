import { type FC } from "react";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { convertToDate, copyToClipboard } from "@agreeto/calendar-core";
import Availability from "./availability";
import { Attendees } from "./attendees";
import { IoClose } from "react-icons/io5";

import { Spinner } from "@agreeto/ui";
import { trpc } from "../../utils/trpc";
import { useEventStore } from "../../utils/store";
import clsx from "clsx";
import { type SharedRoutes } from "../../calendar";

const actionTypes = {
  "Copy and Close":
    "Copies the selected time slots to your clipboard, then closes the application.",
  "Create Hold and Copy":
    "Creates unconfirmed events in the calendar of each attendee, then copies the selected time slots.",
};
export type ActionType = keyof typeof actionTypes;

type Props = {
  onClose?: () => void;
  onPageChange?: (page: SharedRoutes) => void;
  onPrimaryActionClick?: (type: ActionType) => void;
};

const ActionPane: FC<Props> = ({
  onClose,
  onPageChange,
  onPrimaryActionClick,
}) => {
  const utils = trpc.useContext();

  const title = useEventStore((s) => s.title);
  const resetTitle = useEventStore((s) => s.resetTitle);
  const updateTitle = useEventStore((s) => s.updateTitle);
  const attendees = useEventStore((s) => s.attendees);
  const unknownAttendees = useEventStore((s) => s.unknownAttendees);
  const clearAttendees = useEventStore((s) => s.clearAttendees);

  const selectedSlots = useEventStore((s) => s.selectedSlots);
  const clearSlots = useEventStore((s) => s.clearSlots);

  const [isCreating, setIsCreating] = useState(false);
  const [showCreatingSpinner, setShowCreatingSpinner] = useState(false);

  const [buttonType] = useState<ActionType>("Copy and Close");

  const { data: preference } = trpc.preference.byCurrentUser.useQuery();
  const { mutate: createEventGroup, isLoading: isCreatingEventGroup } =
    trpc.eventGroup.create.useMutation({
      onSuccess() {
        clearAttendees();
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
          attendees: [...attendees, ...unknownAttendees],
        };
      }),
    });
  };

  // TESTING PURPOSES TO QUICKLY SWITCH BETWEEN PAYMENT TIERS
  const { data: user } = trpc.user.me.useQuery();
  const { mutate: updateUserTier } = trpc.user.updateTier.useMutation({
    onSettled() {
      utils.user.me.invalidate();
    },
  });

  // TODO (richard): Replace this with radix' popup
  const actionTypesPopup = <div>popup replacement</div>;

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
            <div className="flex flex-1 justify-end">
              {/* TODO: (Remove) Testing Tier Button */}
              {user?.membership && (
                <button
                  className="mr-2 rounded border-2 border-primary text-sm font-semibold text-primary hover:bg-primary hover:text-white"
                  onClick={() => {
                    updateUserTier({
                      tier: user?.membership === "FREE" ? "PRO" : "FREE",
                    });
                  }}
                >
                  {user?.membership}
                </button>
              )}
              <button
                className="cursor-pointer rounded bg-red-500 p-1 hover:bg-red-600"
                onClick={handleClose}
              >
                <IoClose className="h-6 w-6 text-white" />
              </button>
            </div>
          )}

          {/* Title input */}
          <input
            className="mt-6 w-full border-b-2 border-gray-400 bg-transparent px-2 text-xl outline-none hover:border-primary focus:border-primary"
            placeholder="Add a title"
            value={title}
            onChange={(e) => updateTitle(e.target.value)}
          />

          {/* Attendees */}
          <div className="pt-4">
            <Attendees onPageChange={onPageChange} />
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
