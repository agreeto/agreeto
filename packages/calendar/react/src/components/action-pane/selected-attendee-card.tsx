import { type FC } from "react";
import trashIcon from "../../assets/trash.svg";
import { type RouterOutputs } from "../../utils/trpc";

type Props = {
  attendee: RouterOutputs["user"]["getFriends"][number] & { color: string };

  onDelete: (id: string) => void;
  hideDeleteButton: boolean;
};

const SelectedAttendeeCard: FC<Props> = ({
  attendee,
  onDelete,
  hideDeleteButton,
}) => {
  const { id, color, email } = attendee;

  return (
    <div className="flex text-sm px-2 py-1 color-gray-900 rounded group hover:bg-gray-200">
      <div className="flex w-full space-x-2 items-center justify-between">
        {/* Color and email */}
        <div className="flex space-x-2 items-center">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: color }}
          />
          <div className="text-xs">{email}</div>
        </div>

        {/* Delete button */}
        {!hideDeleteButton && (
          <div className="w-0 group-hover:w-3">
            <img
              className="cursor-pointer"
              src={trashIcon}
              alt="delete"
              title="Delete"
              width={10}
              height={10}
              onClick={() => onDelete(id)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectedAttendeeCard;
