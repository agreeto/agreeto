import { useState } from "react";
import OutsideClickHandler from "react-outside-click-handler";
import { Spinner } from "@agreeto/ui";
import { BiSearch } from "react-icons/bi";
import { Float } from "@headlessui-float/react";
import { trpc } from "../../utils/trpc";
import { type RouterOutputs } from "@agreeto/api";
import type {
  EventColorUserRadix,
  EventColorDirectoryUserRadix,
} from "@agreeto/api/client";
import { EventResponseStatus, Membership } from "@agreeto/api/client";
import clsx from "clsx";
import { DebouncedInput } from "./debounced-input";
import { z } from "zod";
import { toast } from "react-toastify";
import { useEventStore } from "../../utils/store";
import { BiTrash } from "react-icons/bi";
import { themeColors, unknownColorName } from "../../utils/colors";
import { type SharedRoutes } from "../../calendar";

const SelectedAttendeeCard: React.FC<{
  color:
    | EventColorUserRadix
    | EventColorDirectoryUserRadix
    | typeof unknownColorName;
  email: string;
  deleteAttendee: () => void;
  hideDeleteButton: boolean;
}> = ({ color, email, deleteAttendee, hideDeleteButton }) => {
  return (
    <div className="group flex rounded px-2 py-1 text-sm text-gray-900 hover:bg-gray-200">
      <div className="flex w-full items-center justify-between space-x-2">
        {/* Color and email */}
        <div className="flex items-center space-x-2">
          <div
            className={"h-3 w-3 rounded-full"}
            style={{
              backgroundColor: themeColors[color][7],
            }}
          />
          <div className="text-xs">{email}</div>
        </div>

        {/* Delete button */}
        {!hideDeleteButton && (
          <button
            onClick={deleteAttendee}
            className="w-3 cursor-pointer opacity-0 group-hover:opacity-100"
          >
            <BiTrash className="h-full text-gray-900 hover:text-gray-600" />
          </button>
        )}
      </div>
    </div>
  );
};

const AddUnknownAttendee: React.FC<{ text: string; clearText: () => void }> = ({
  text,
  clearText,
}) => {
  const addUnknownAttendee = useEventStore((s) => s.addUnknownAttendee);
  return (
    <div
      className="cursor-pointer px-3 py-1 text-xs text-gray-600 hover:bg-gray-200"
      onClick={() => {
        // Check if email is valid, else show error-toast
        if (!z.string().email().safeParse(text).success) {
          toast("Enter a valid email", {
            position: "bottom-center",
            hideProgressBar: true,
            autoClose: 2000,
            type: "error",
          });
          return;
        }
        // Add attendee to unknown attendees
        addUnknownAttendee({
          id: text,
          name: text,
          surname: "",
          email: text,
          // Escape hatch to not have to modify types just to get typescript
          // to accept our unknown color. We don't want the unknown color to be
          // selectable on the backend, thus we don't add it to the enum.
          color: unknownColorName as "red",
          provider: "google",
          responseStatus: EventResponseStatus.NEEDS_ACTION,
        });

        clearText();
      }}
    >
      + Add {text}
    </div>
  );
};

/** Card rendered for each response from the search query */
const AttendeeOptionCard: React.FC<{
  user?: RouterOutputs["user"]["getFriends"][number];
  onSelect: () => void;
}> = ({ user, onSelect }) => {
  const attendees = useEventStore((s) => s.attendees);
  const addAttendee = useEventStore((s) => s.addAttendee);

  if (!user) return null;

  const alreadySelected = attendees.some((a) => a.id === user.id);
  // Do not render if already selected
  if (alreadySelected) return null;

  return (
    <div
      className="cursor-pointer px-3 py-1 text-xs text-gray-600 hover:bg-gray-200"
      key={user.id}
      onClick={() => {
        addAttendee(user);
        onSelect();
      }}
    >
      {user.email}
    </div>
  );
};

export const Attendees: React.FC<{
  eventGroup?: RouterOutputs["eventGroup"]["byId"];

  onPageChange?: (page: SharedRoutes) => void;
}> = ({ eventGroup, onPageChange }) => {
  const [showProTooltip, setShowProTooltip] = useState(false);
  const [isAttendeePopupOpen, setIsAttendeePopupOpen] = useState(false);
  const [attendeeText, setAttendeeText] = useState("");

  const attendees = useEventStore((s) => s.attendees);
  const unknownAttendees = useEventStore((s) => s.unknownAttendees);
  const removeAttendee = useEventStore((s) => s.removeAttendee);
  const removeUnknownAttendee = useEventStore((s) => s.removeUnknownAttendee);

  const { data: user } = trpc.user.me.useQuery();
  const isFree = user?.membership === Membership.FREE;

  // Fetch directory users from providers
  const { data: directoryUsers, isFetching: isLoadingUsers } =
    trpc.user.getFriends.useQuery(
      { search: attendeeText, occupiedColors: attendees.map((a) => a.color) },
      {
        keepPreviousData: true,
        staleTime: 60 * 1000,
        enabled: !isFree && attendeeText.length > 0,
      },
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
        {attendees.map((attendee) => (
          <SelectedAttendeeCard
            {...{
              key: attendee.id,
              // REVIW (richard): What do we need this color for when adding attendees?
              color: attendee.color,
              email: attendee.email,
              hideDeleteButton: !!eventGroup?.isSelectionDone,
              deleteAttendee: () => removeAttendee(attendee.id),
            }}
          />
        ))}

        {/* Unknown attendees */}
        {unknownAttendees.map(({ email }) => (
          <SelectedAttendeeCard
            {...{
              key: email,
              color: unknownColorName,
              email,
              hideDeleteButton: false,
              deleteAttendee: () => removeUnknownAttendee(email),
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
                  <DebouncedInput
                    className={clsx(
                      "box-border h-full w-full appearance-none rounded border border-transparent px-1 outline-none hover:border-primary",
                      {
                        "bg-gray-100": isFree,
                      },
                    )}
                    disabled={isFree}
                    placeholder="Search for people"
                    onFocus={() => setIsAttendeePopupOpen(true)}
                    onChange={(e) => setAttendeeText(e)}
                    value={attendeeText}
                  />
                  {/** Icon inside input field */}
                  <div className="absolute mr-2 h-4 w-4">
                    {isLoadingUsers ? (
                      <Spinner />
                    ) : (
                      <BiSearch className="h-4 w-4" />
                    )}
                  </div>
                </label>
              </div>
              <div
                className="mt-4 w-60 cursor-auto rounded border border-[#F9FAFA] bg-[#F9FAFA] p-4 text-left"
                style={{ boxShadow: "2px 4px 12px 2px #dbd9d9" }}
              >
                <div className="text-sm font-semibold text-gray-900">
                  Unlock Other Attendees
                </div>
                <div className="mt-2 text-xs text-gray-900">
                  This feature is part of the Pro Plan
                </div>
                <div
                  className="mt-8 flex h-8 w-full cursor-pointer items-center justify-center rounded border border-primary text-primary"
                  onClick={() => onPageChange?.("/settings/subscription")}
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
              {attendeeText && (
                <AddUnknownAttendee
                  {...{
                    text: attendeeText,
                    clearText: () => setAttendeeText(""),
                  }}
                />
              )}
              {directoryUsers?.map((user) => (
                <AttendeeOptionCard
                  {...{
                    key: user.id,
                    user,
                    onSelect: () => {
                      setAttendeeText("");
                      setIsAttendeePopupOpen(false);
                    },
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </OutsideClickHandler>
    </div>
  );
};
