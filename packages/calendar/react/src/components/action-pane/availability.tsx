import { type EventInput } from "@fullcalendar/react";
import { format } from "date-fns-tz";
import { type FC } from "react";
import { toast } from "react-toastify";
import copyIcon from "../../assets/copy.svg";
import trashIcon from "../../assets/trash.svg";
import flagUSIcon from "../../assets/flag-us.svg";
import flagDeIcon from "../../assets/flag-de.svg";
import flagEsIcon from "../../assets/flag-es.svg";
import flagItIcon from "../../assets/flag-it.svg";
import flagFrIcon from "../../assets/flag-fr.svg";
import arrowDownIcon from "../../assets/arrow-down.svg";
import { convertToDate } from "../../utils/date.helper";
import { copyToClipboard, getGroupedSlots } from "../../utils/event.helper";
import { ulid } from "ulid";

import { Language, Membership } from "@agreeto/db";
import {
  getCopyTitle,
  getDateLocale,
  getHourText,
} from "../../utils/locale.helper";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import type { RootState } from "../../redux/store";
import { useDispatch, useSelector } from "react-redux";
import { changeSelectedTimeZone } from "../../redux/time-zone.slice";
import { getTimeZoneAbv } from "../../utils/time-zone.helper";
import { trpc } from "../../utils/trpc";

type Props = {
  selectedSlots: EventInput[];
  onDelete: (event: EventInput) => void;
  onPageChange?: (page: string) => void;
};

const Availability: FC<Props> = ({ selectedSlots, onDelete, onPageChange }) => {
  const dispatch = useDispatch();
  const utils = trpc.useContext();

  // Redux
  const { timeZones, selectedTimeZone } = useSelector(
    (state: RootState) => state.timeZone
  );

  const { data: user } = trpc.user.me.useQuery();
  const isFree = user?.membership === Membership.FREE;
  const { data: preference, isFetching: isFetchingPreference } =
    trpc.preference.byCurrentUser.useQuery();
  const { mutate: updatePreference, isLoading: isUpdatingPreference } =
    trpc.preference.update.useMutation({
      async onSettled() {
        await utils.preference.byCurrentUser.invalidate();
      },
    });
  const locale = getDateLocale(preference);

  const handleLanguageChange = (lang: Language) => {
    updatePreference({ formatLanguage: lang });
  };

  const getLanguageIcon = () => {
    switch (preference?.formatLanguage) {
      case Language.DE:
        return flagDeIcon;
      case Language.FR:
        return flagFrIcon;
      case Language.IT:
        return flagItIcon;
      case Language.ES:
        return flagEsIcon;
      default:
        return flagUSIcon;
    }
  };

  const copyButton = (
    <div>
      <button
        className="icon-button w-7 h-7"
        title="copy"
        disabled={selectedSlots.length === 0}
        onClick={() => {
          copyToClipboard(selectedSlots, preference);
          toast("Saved to clipboard!", {
            position: "bottom-center",
            hideProgressBar: true,
            autoClose: 1000,
            type: "info",
          });
        }}
      >
        <img src={copyIcon} alt="copy" className="w-5 h-5" />
      </button>
    </div>
  );

  const languageDropdown = (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        disabled={isFetchingPreference || isUpdatingPreference}
      >
        <div className="h-6 bg-white color-gray-700 rounded border border-gray-300 w-14 flex py-1 px-2 items-center space-x-3">
          <div>
            <img src={getLanguageIcon()} width={14} height={14} alt="" />
          </div>
          <div>
            <img src={arrowDownIcon} width={12} height={7} alt="" />
          </div>
        </div>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        className="z-10 bg-white color-gray-700 rounded"
        style={{ boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.10)" }}
        align="end"
      >
        <DropdownMenu.Item
          onSelect={() => {
            handleLanguageChange(Language.EN);
          }}
        >
          <div className="pl-4 py-3 flex items-center w-40 cursor-pointer">
            <div>
              <img src={flagUSIcon} width={14} height={14} alt="" />
            </div>
            <div className="pl-4 text-sm">English (US)</div>
          </div>
        </DropdownMenu.Item>
        <DropdownMenu.Separator
          className="bg-gray-100 mx-3"
          style={{ height: "1px" }}
        />

        {isFree ? (
          <>
            <div className="pl-4 py-3 flex items-center w-40 cursor-not-allowed opacity-40">
              <div>
                <img src={flagEsIcon} width={14} height={14} alt="" />
              </div>
              <div className="pl-4 text-sm">Spanish (ES)</div>
            </div>

            <div className="p-4">
              <div className="color-gray-900 font-semibold text-sm">
                Unlock More Languages
              </div>
              <div className="color-gray-900 text-xs mt-2">
                This feature is part of the Pro Plan
              </div>
              <div
                className="w-full mt-8 h-8 flex justify-center items-center border rounded border-primary color-primary cursor-pointer"
                onClick={() => onPageChange?.("settings")}
              >
                Upgrade
              </div>
            </div>
          </>
        ) : (
          <>
            <DropdownMenu.Item
              onSelect={() => {
                handleLanguageChange(Language.ES);
              }}
            >
              <div className="pl-4 py-3 flex items-center w-40 cursor-pointer">
                <div>
                  <img src={flagEsIcon} width={14} height={14} alt="Spanish" />
                </div>
                <div className="pl-4 text-sm">Spanish (ES)</div>
              </div>
            </DropdownMenu.Item>
            <DropdownMenu.Separator
              className="bg-gray-100 mx-3"
              style={{ height: "1px" }}
            />
            <DropdownMenu.Item
              onSelect={() => {
                handleLanguageChange(Language.DE);
              }}
            >
              <div className="pl-4 py-3 flex items-center w-40 cursor-pointer">
                <div>
                  <img src={flagDeIcon} width={14} height={14} alt="German" />
                </div>
                <div className="pl-4 text-sm">German (DE)</div>
              </div>
            </DropdownMenu.Item>
            <DropdownMenu.Separator
              className="bg-gray-100 mx-3"
              style={{ height: "1px" }}
            />
            <DropdownMenu.Item
              onSelect={() => {
                handleLanguageChange(Language.FR);
              }}
            >
              <div className="pl-4 py-3 flex items-center w-40 cursor-pointer">
                <div>
                  <img src={flagFrIcon} width={14} height={14} alt="French" />
                </div>
                <div className="pl-4 text-sm">French (FR)</div>
              </div>
            </DropdownMenu.Item>
            <DropdownMenu.Separator
              className="bg-gray-100 mx-3"
              style={{ height: "1px" }}
            />
            <DropdownMenu.Item
              onSelect={() => {
                handleLanguageChange(Language.IT);
              }}
            >
              <div className="pl-4 py-3 flex items-center w-40 cursor-pointer">
                <div>
                  <img src={flagItIcon} width={14} height={14} alt="Italian" />
                </div>
                <div className="pl-4 text-sm">Italian (IT)</div>
              </div>
            </DropdownMenu.Item>
          </>
        )}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );

  const timeZoneDropdown = (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <div className="h-6 bg-white color-gray-700 rounded border border-gray-300 flex py-1 px-1 items-center space-x-2">
          <div className="text-2xs">{getTimeZoneAbv(selectedTimeZone)}</div>
          <div>
            <img src={arrowDownIcon} width={12} height={7} alt="" />
          </div>
        </div>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        className="z-10 bg-white color-gray-700 rounded"
        align="end"
        style={{ boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.10)" }}
      >
        {timeZones.map((tz, idx) => (
          <DropdownMenu.Item
            key={`${tz}-${idx}`}
            onSelect={() => {
              dispatch(changeSelectedTimeZone(tz));
            }}
          >
            <div className="px-3 bg-white py-1 cursor-pointer">
              <div className="text-xs">{getTimeZoneAbv(tz)}</div>
            </div>
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );

  return (
    <>
      <div className="flex items-center justify-between w-100">
        <div>
          <span className="text-sm">Snippet Preview</span>
        </div>
        <div className="flex space-x-2 leading-none">
          <div>{timeZoneDropdown}</div>
          <div>{languageDropdown}</div>
        </div>
      </div>

      <div className="pt-2">
        <div className="h-48 pl-3 pr-1 py-1 overflow-auto bg-white border rounded border-gray-50">
          {!selectedSlots.length ? (
            <div className="flex justify-between">
              <div
                className="text-sm color-gray-200"
                style={{ paddingTop: "2px" }}
              >
                Selected slots will appear here
              </div>
              {copyButton}
            </div>
          ) : (
            <div>
              <div className="pb-3 flex justify-between">
                <div className="text-sm" style={{ paddingTop: "2px" }}>
                  <span className="color-gray-700">
                    {getCopyTitle(preference)}
                  </span>
                </div>
                {copyButton}
              </div>
              {Object.keys(getGroupedSlots(selectedSlots)).map((key, idx) => {
                const events: EventInput[] =
                  getGroupedSlots(selectedSlots)[key];
                const firstEvent = events[0];
                if (!firstEvent) return null;

                return (
                  <div className="pb-1 text-xs-05 color-gray-700" key={idx}>
                    {/* Day */}
                    <div className="font-bold">
                      {format(
                        convertToDate(firstEvent.start),
                        "MMMM d (EEEE)",
                        { locale, timeZone: selectedTimeZone }
                      )}
                    </div>
                    {/* Hours */}
                    {events.map((event) => {
                      const { start, end, id } = event;
                      return (
                        // todo: update to a proper id
                        <div className="flex items-center" key={id ?? ulid()}>
                          <span>•</span>
                          <span className="pl-1">
                            {`${getHourText(convertToDate(start), {
                              locale,
                              timeZone: selectedTimeZone,
                            })} - ${getHourText(convertToDate(end), {
                              locale,
                              timeZone: selectedTimeZone,
                            })} ${getTimeZoneAbv(
                              selectedTimeZone,
                              convertToDate(start)
                            )}`}
                          </span>
                          <img
                            className="ml-3 cursor-pointer"
                            src={trashIcon}
                            alt="delete"
                            title="Delete"
                            onClick={() => onDelete(event)}
                            width={10}
                            height={10}
                          />
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Availability;
