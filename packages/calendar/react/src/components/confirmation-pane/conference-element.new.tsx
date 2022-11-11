import React from "react";
import { type RouterOutputs } from "../../utils/trpc";
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
        className={`relative mt-2 px-3 py-2 w-100 flex justify-between items-center bg-white rounded-lg ${
          !eventGroup.createBlocker ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {/* Check icon */}
        {addConference && (
          <div className="absolute -right-2 -top-2">
            <img src={checkMark2Icon} className="w-4 h-4" alt="" />
          </div>
        )}

        {/* Icon and title */}
        <div className="flex items-center">
          {provider === "google" ? (
            <>
              <img src={googleMeetIcon} alt="meet" className="w-8 h-8" />
              <span className="pl-3 color-gray-900 font-medium text-sm">
                Google Meet
              </span>
            </>
          ) : (
            <>
              <img src={teamsIcon} alt="teams" className="w-7 h-7" />
              <span className="pl-2 color-gray-900 font-medium text-sm">
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
