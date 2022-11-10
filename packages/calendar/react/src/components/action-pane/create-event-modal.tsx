import { type ChangeEventHandler, type FC } from "react";
import { Modal } from "../modal";

type Props = {
  isOpen: boolean;
  onVisibilityChange: (open: boolean) => void;
  title: string;
  onTitleChange: ChangeEventHandler<HTMLInputElement>;
};

const CreateEventModal: FC<Props> = ({
  isOpen,
  onVisibilityChange,
  title,
  onTitleChange,
}) => {
  const titleElem = (
    <div className="pt-8 flex justify-end">
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
            <div className="color-gray-600 font-medium pt-8">Date</div>
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

export default CreateEventModal;
