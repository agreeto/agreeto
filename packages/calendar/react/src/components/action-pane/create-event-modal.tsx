import React from "react";
import { Modal } from "@agreeto/ui";

export const CreateEventModal: React.FC<{
  isOpen: boolean;
  onVisibilityChange: (open: boolean) => void;
  title: string;
  onTitleChange: React.ChangeEventHandler<HTMLInputElement>;
}> = ({ isOpen, onVisibilityChange, title, onTitleChange }) => {
  const titleElem = (
    <div className="flex justify-end pt-8">
      <input
        className="input input-big w-full"
        placeholder="Add a title"
        value={title}
        onChange={onTitleChange}
      />
    </div>
  );

  return (
    <Modal
      open={isOpen}
      customBody={
        <div>
          {/* Title */}
          {titleElem}
          {/* Date */}
          <div>
            <div className="pt-8 font-medium text-gray-600">Date</div>
          </div>
        </div>
      }
      closeIconButton={{
        onClick: () => onVisibilityChange(false),
      }}
      primaryButton={{
        className: "w-32",
        text: "Save",
        onClick: () => console.log("Save"),
      }}
    />
  );
};
