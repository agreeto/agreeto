import { useState } from "react";
import OutsideClickHandler from "react-outside-click-handler";
import { Spinner } from "@agreeto/ui";
import { AiOutlineSearch } from "react-icons/ai";
import { SelectedAttendeeCard } from "./selected-attendee-card";
import { UnknownAttendeeCard } from "./unknown-attendee-card";
import { Float } from "@headlessui-float/react";
import { trpc } from "../../utils/trpc";
import { type RouterOutputs } from "@agreeto/api";
import { EventResponseStatus, Membership } from "@agreeto/api/types";
import clsx from "clsx";
import { DebouncedInput } from "./debounced-input";
import { z } from "zod";
import { toast } from "react-toastify";
import { useEventStore } from "../../utils/store";

export const Attendees: React.FC<{
  eventGroup?: RouterOutputs["eventGroup"]["byId"];

  onPageChange?: (page: string) => void;
}> = ({ eventGroup, onPageChange }) => {
  const [showProTooltip, setShowProTooltip] = useState(false);
  const [isAttendeePopupOpen, setIsAttendeePopupOpen] = useState(false);
  const [attendeeText, setAttendeeText] = useState("");

  const attendees = useEventStore((s) => s.attendees);
  const unknownAttendees = useEventStore((s) => s.unknownAttendees);
  const addAttendee = useEventStore((s) => s.addAttendee);
  const addUnknownAttendee = useEventStore((s) => s.addUnknownAttendee);
  const removeAttendee = useEventStore((s) => s.removeAttendee);
  const removeUnknownAttendee = useEventStore((s) => s.removeUnknownAttendee);

  const { data: user } = trpc.user.me.useQuery();
  const isFree = user?.membership === Membership.FREE;

  // Fetch directory users from providers
  const { data: directoryUsers, isFetching: isLoadingUsers } =
    trpc.user.getFriends.useQuery(
      { search: attendeeText, occupiedColors: attendees.map((u) => u.color) },
      {
        keepPreviousData: true,
        staleTime: 60 * 1000,
        enabled: !isFree && attendeeText.length > 0,
      },
    );

  /** Card rendered for each response from the search query */
  const AttendeeOptionCard: React.FC<{
    user?: RouterOutputs["user"]["getFriends"][number];
  }> = ({ user }) => {
    if (!user) return null;

    const alreadySelected = attendees.some((a) => a.id === user.id);
    // Do not render if already selected
    if (alreadySelected) return null;

    return (
      <div
        className="color-gray-600 cursor-pointer px-3 py-1 text-xs hover:bg-gray-200"
        key={user.id}
        onClick={() => {
          addAttendee(user);
          setIsAttendeePopupOpen(false);
          setAttendeeText("");
        }}
      >
        {user.email}
      </div>
    );
  };

  // Add unknown attendee to the users list by email
  const AddUnknownAttendee: React.FC = () => (
    <div
      className="color-gray-600 cursor-pointer px-3 py-1 text-xs hover:bg-gray-200"
      onClick={() => {
        // Check if email is valid, else show error-toast
        if (!z.string().email().safeParse(attendeeText).success) {
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
          id: attendeeText,
          name: attendeeText,
          surname: "",
          email: attendeeText,
          color: "#C4C4C4",
          provider: "google",
          responseStatus: EventResponseStatus.NEEDS_ACTION,
        });
        setAttendeeText("");
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
        {attendees.map((attendee) => (
          <SelectedAttendeeCard
            {...{
              key: attendee.id,
              id: attendee.id,
              color: attendee.color,
              email: attendee.email,
              hideDeleteButton: !!eventGroup?.isSelectionDone,
              onDelete(id) {
                removeAttendee(id);
              },
            }}
          />
        ))}

        {/* Unknown attendees */}
        {unknownAttendees.map(({ email }) => (
          <UnknownAttendeeCard
            key={email}
            email={email}
            onDelete={(email) => removeUnknownAttendee(email)}
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
                {attendeeText && <AddUnknownAttendee />}
                {directoryUsers?.map((user) => (
                  <AttendeeOptionCard key={user.id} user={user} />
                ))}
              </>
            </div>
          )}
        </div>
      </OutsideClickHandler>
    </div>
  );
};
