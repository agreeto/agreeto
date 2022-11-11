import React from "react";
import { type RouterOutputs } from "@agreeto/api";
import checkMark2Icon from "../../assets/check-mark-2.png";
import googleMeetIcon from "../../assets/google-meet.svg";
import teamsIcon from "../../assets/ms-teams.svg";

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
          <div className="absolute -right-2 -top-2">
            <img src={checkMark2Icon} className="h-4 w-4" alt="" />
          </div>
        )}

        {/* Icon and title */}
        <div className="flex items-center">
          {provider === "google" ? (
            <>
              <img src={googleMeetIcon} alt="meet" className="h-8 w-8" />
              <span className="color-gray-900 pl-3 text-sm font-medium">
                Google Meet
              </span>
            </>
          ) : (
            <>
              <img src={teamsIcon} alt="teams" className="h-7 w-7" />
              <span className="color-gray-900 pl-2 text-sm font-medium">
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
