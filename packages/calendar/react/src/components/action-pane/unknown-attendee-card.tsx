import React from "react";
import trashIcon from "../../assets/trash.svg";

export const UnknownAttendeeCard: React.FC<{
  email: string;
  onDelete: (email: string) => void;
}> = ({ email, onDelete }) => {
  return (
    <div className="color-gray-900 group flex rounded px-2 py-1 text-sm hover:bg-gray-200">
      <div className="flex w-full items-center justify-between space-x-2">
        {/* Color and email */}
        <div className="flex items-center space-x-2">
          <div className="h-3 w-3 rounded-full bg-gray-400" />
          <div className="text-xs">{email}</div>
        </div>

        {/* Delete button */}
        <div className="w-0 group-hover:w-3">
          <img
            className="cursor-pointer"
            src={trashIcon}
            alt="delete"
            title="Delete"
            width={10}
            height={10}
            onClick={() => onDelete(email)}
          />
        </div>
      </div>
    </div>
  );
};
