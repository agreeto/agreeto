import React from "react";
import trashIcon from "../../assets/trash.svg";

export const SelectedAttendeeCard: React.FC<{
  id: string;
  color: string;
  email: string;
  onDelete: (id: string) => void;
  hideDeleteButton: boolean;
}> = ({ id, color, email, onDelete, hideDeleteButton }) => {
  return (
    <div className="group flex rounded px-2 py-1 text-sm text-gray-900 hover:bg-gray-200">
      <div className="flex w-full items-center justify-between space-x-2">
        {/* Color and email */}
        <div className="flex items-center space-x-2">
          <div
            className="h-3 w-3 rounded-full"
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
