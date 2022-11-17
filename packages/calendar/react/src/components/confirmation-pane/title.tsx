import React from "react";
import { toast } from "react-toastify";
import { copyToClipboard, convertToSlot } from "@agreeto/calendar-core";
import { trpc } from "../../utils/trpc";
import { type RouterOutputs } from "@agreeto/api";
import { BiCheckCircle, BiCopy } from "react-icons/bi";

type EventGroupEvents = RouterOutputs["eventGroup"]["byId"]["events"];

export const Title: React.FC<{
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  isSelectionDone: boolean;
  events: EventGroupEvents | undefined;
}> = ({ title, setTitle, isSelectionDone, events }) => {
  const { data: preference } = trpc.preference.byCurrentUser.useQuery();
  const [copied, setCopied] = React.useState(false);

  return (
    <div>
      <input
        className="mt-6 w-full border-b-2 border-gray-400 bg-transparent px-2 text-xl outline-none hover:border-primary focus:border-primary"
        placeholder="Add a title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        readOnly={isSelectionDone}
      />

      <div className="w-100 flex justify-between pt-4">
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
          <button
            className="h-7 w-7 pl-1"
            title="copy"
            disabled={!events}
            onClick={() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
              copyToClipboard(
                events!.map((e) => convertToSlot(e as any)),
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
            {copied ? (
              <BiCheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <BiCopy className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};
