import React from "react";
import { type RouterOutputs } from "@agreeto/api";
import { HiCheckCircle } from "react-icons/hi";
import googleMeetIcon from "../../assets/google-meet.svg";
import { SiMicrosoftteams } from "react-icons/si";

export const ConferenceElement: React.FC<{
  eventGroup: RouterOutputs["eventGroup"]["byId"];
  addConference: boolean;
  provider: string;
  setAddConference: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ eventGroup, addConference, provider, setAddConference }) => {
  return (
    <div>
      <div className="pt-3">
        <span className="text-sm">Location</span>
      </div>

      <div
        className={`w-100 relative mt-2 flex items-center justify-between rounded-lg bg-white px-3 py-2 ${
          !eventGroup.createBlocker ? "cursor-not-allowed opacity-50" : ""
        }`}
      >
        {/* Check icon */}
        {addConference && (
          <HiCheckCircle className=" absolute -right-2 -top-2 h-5 w-5 text-green-500" />
        )}

        {/* Icon and title */}
        <div className="flex items-center">
          {provider === "google" ? (
            <>
              <img src={googleMeetIcon} alt="meet" className="h-7 w-7" />
              <span className="pl-3 text-sm font-medium text-gray-900">
                Google Meet
              </span>
            </>
          ) : (
            <>
              <SiMicrosoftteams className="h-7 w-7 text-[#6264A7]" />
              <span className="pl-2 text-sm font-medium text-gray-900">
                Microsoft Teams
              </span>
            </>
          )}
        </div>

        {/* Button */}
        <div>
          <button
            className="button-outline button-small"
            onClick={() => setAddConference(!addConference)}
            disabled={!eventGroup?.createBlocker}
          >
            {addConference ? "Remove" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
};
