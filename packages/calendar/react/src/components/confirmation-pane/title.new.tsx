import React from "react";
import { toast } from "react-toastify";
import { copyToClipboard, convertToSlot } from "@agreeto/calendar-core";
import { trpc } from "../../utils/trpc";
import { type RouterOutputs } from "@agreeto/api";
import copyIcon from "../../assets/copy.svg";

type EventGroupEvents = RouterOutputs["eventGroup"]["byId"]["events"];

export const Title: React.FC<{
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  isSelectionDone: boolean;
  events: EventGroupEvents | undefined;
}> = ({ title, setTitle, isSelectionDone, events }) => {
  const { data: preference } = trpc.preference.byCurrentUser.useQuery();

  return (
    <div>
      <div>
        <input
          className="input input-big w-full"
          placeholder="Add a title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          readOnly={isSelectionDone}
        />
      </div>

      <div className="w-100 mt-4 flex justify-between">
        <div>
          <span className="text-sm">
            {!isSelectionDone ? (
              "Select your slot"
            ) : (
              <div className="pb-1">
                <span className="text-sm">You selected the following slot</span>
              </div>
            )}
          </span>
        </div>

        {/* Copy button */}
        {!isSelectionDone && (
          <div>
            <button
              className="icon-button h-7 w-7"
              title="copy"
              onClick={() => {
                if (!events) return;

                copyToClipboard(
                  // FIXME: ANY TYPE
                  events.map((e) => convertToSlot(e as any)),
                  preference,
                );
                toast("Saved to clipboard!", {
                  position: "bottom-center",
                  hideProgressBar: true,
                  autoClose: 1000,
                  type: "info",
                });
              }}
            >
              <img src={copyIcon} alt="copy" className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
