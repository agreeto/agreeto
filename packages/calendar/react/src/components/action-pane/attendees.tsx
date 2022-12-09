// import { useState } from "react";
// import { Spinner } from "@agreeto/ui";
// import { BiSearch } from "react-icons/bi";
// import { Float } from "@headlessui-float/react";
// import { trpc } from "../../utils/trpc";
import { type RouterOutputs } from "@agreeto/api";
import type {
  EventColorUserRadix,
  EventColorDirectoryUserRadix,
} from "@agreeto/api/types";
// import { EventResponseStatus, Membership } from "@agreeto/api/types";
// import clsx from "clsx";
// import { DebouncedInput } from "./debounced-input";
// import { z } from "zod";
// import { toast } from "react-toastify";
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

// const AddUnknownAttendee: React.FC<{ text: string; clearText: () => void }> = ({
//   text,
//   clearText,
// }) => {
//   const addUnknownAttendee = useEventStore((s) => s.addUnknownAttendee);
//   return (
//     <div
//       className="px-3 py-1 text-xs text-gray-600 cursor-pointer hover:bg-gray-200"
//       onClick={() => {
//         // Check if email is valid, else show error-toast
//         if (!z.string().email().safeParse(text).success) {
//           toast("Enter a valid email", {
//             position: "bottom-center",
//             hideProgressBar: true,
//             autoClose: 2000,
//             type: "error",
//           });
//           return;
//         }
//         // Add attendee to unknown attendees
//         addUnknownAttendee({
//           id: text,
//           name: text,
//           surname: "",
//           email: text,
//           // Escape hatch to not have to modify types just to get typescript
//           // to accept our unknown color. We don't want the unknown color to be
//           // selectable on the backend, thus we don't add it to the enum.
//           color: unknownColorName as "red",
//           provider: "google",
//           responseStatus: EventResponseStatus.NEEDS_ACTION,
//         });

//         clearText();
//       }}
//     >
//       + Add {text}
//     </div>
//   );
// };

/** Card rendered for each response from the search query */
// const AttendeeOptionCard: React.FC<{
//   user?: RouterOutputs["user"]["getFriends"][number];
//   onSelect: () => void;
// }> = ({ user, onSelect }) => {
//   const attendees = useEventStore((s) => s.attendees);
//   const addAttendee = useEventStore((s) => s.addAttendee);

//   if (!user) return null;

//   const alreadySelected = attendees.some((a) => a.id === user.id);
//   // Do not render if already selected
//   if (alreadySelected) return null;

//   return (
//     <div
//       className="px-3 py-1 text-xs text-gray-600 cursor-pointer hover:bg-gray-200"
//       key={user.id}
//       onClick={() => {
//         addAttendee(user);
//         onSelect();
//       }}
//     >
//       {user.email}
//     </div>
//   );
// };

export const Attendees: React.FC<{
  eventGroup?: RouterOutputs["eventGroup"]["byId"];

  onPageChange?: (page: SharedRoutes) => void;
}> = ({ eventGroup }) => {
  const attendees = useEventStore((s) => s.attendees);
  const unknownAttendees = useEventStore((s) => s.unknownAttendees);
  const removeAttendee = useEventStore((s) => s.removeAttendee);
  const removeUnknownAttendee = useEventStore((s) => s.removeUnknownAttendee);

  // FIXME: add into radix popup
  // const { data: user } = trpc.user.me.useQuery();
  // const isFree = user?.membership === Membership.FREE;

  // Fetch directory users from providers
  // const { data: directoryUsers, isFetching: isLoadingUsers } =
  //   trpc.user.getFriends.useQuery(
  //     { search: attendeeText, occupiedColors: attendees.map((a) => a.color) },
  //     {
  //       keepPreviousData: true,
  //       staleTime: 60 * 1000,
  //       enabled: !isFree && attendeeText.length > 0,
  //     },
  //   );

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

      {/* TODO (richard): Replace react-outside-click-hanlder+float with radix popup */}
      {/* Input */}
      <div>Popup placeholder</div>
    </div>
  );
};
