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
import {
  convertToDate,
  copyToClipboard,
  getGroupedSlots,
  getCopyTitle,
  getDateLocale,
  getHourText,
  getTimeZoneAbv,
} from "@agreeto/calendar-core";
import { ulid } from "ulid";
import { Language, Membership } from "@agreeto/calendar-core";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { trpc } from "../../utils/trpc";
import { useStore } from "../../utils/store";

type Props = {
  selectedSlots: EventInput[];
  onDelete: (event: EventInput) => void;
  onPageChange?: (page: string) => void;
};

const Availability: FC<Props> = ({ selectedSlots, onDelete, onPageChange }) => {
  const utils = trpc.useContext();

  const timeZones = useStore((s) => s.timeZones);
  const selectedTimeZone = useStore((s) => s.selectedTimeZone);
  const changeSelectedTimeZone = useStore((s) => s.changeSelectedTimeZone);

  const { data: user } = trpc.user.me.useQuery();
  const isFree = user?.membership === Membership.FREE;

  const { data: preference, isFetching: isFetchingPreference } =
    trpc.preference.byCurrentUser.useQuery();
  const locale = getDateLocale(preference);

  const { mutate: updatePreference, isLoading: isUpdatingPreference } =
    trpc.preference.update.useMutation({
      async onSettled() {
        await utils.preference.byCurrentUser.invalidate();
      },
    });

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
        className="icon-button h-7 w-7"
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
        <img src={copyIcon} alt="copy" className="h-5 w-5" />
      </button>
    </div>
  );

  const languageDropdown = (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        disabled={isFetchingPreference || isUpdatingPreference}
      >
        <div className="color-gray-700 flex h-6 w-14 items-center space-x-3 rounded border border-gray-300 bg-white py-1 px-2">
          <div>
            <img src={getLanguageIcon()} width={14} height={14} alt="" />
          </div>
          <div>
            <img src={arrowDownIcon} width={12} height={7} alt="" />
          </div>
        </div>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        className="color-gray-700 z-10 rounded bg-white"
        style={{ boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.10)" }}
        align="end"
      >
        <DropdownMenu.Item
          onSelect={() => {
            handleLanguageChange(Language.EN);
          }}
        >
          <div className="flex w-40 cursor-pointer items-center py-3 pl-4">
            <div>
              <img src={flagUSIcon} width={14} height={14} alt="" />
            </div>
            <div className="pl-4 text-sm">English (US)</div>
          </div>
        </DropdownMenu.Item>
        <DropdownMenu.Separator
          className="mx-3 bg-gray-100"
          style={{ height: "1px" }}
        />

        {isFree ? (
          <>
            <div className="flex w-40 cursor-not-allowed items-center py-3 pl-4 opacity-40">
              <div>
                <img src={flagEsIcon} width={14} height={14} alt="" />
              </div>
              <div className="pl-4 text-sm">Spanish (ES)</div>
            </div>

            <div className="p-4">
              <div className="color-gray-900 text-sm font-semibold">
                Unlock More Languages
              </div>
              <div className="color-gray-900 mt-2 text-xs">
                This feature is part of the Pro Plan
              </div>
              <div
                className="border-primary color-primary mt-8 flex h-8 w-full cursor-pointer items-center justify-center rounded border"
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
              <div className="flex w-40 cursor-pointer items-center py-3 pl-4">
                <div>
                  <img src={flagEsIcon} width={14} height={14} alt="Spanish" />
                </div>
                <div className="pl-4 text-sm">Spanish (ES)</div>
              </div>
            </DropdownMenu.Item>
            <DropdownMenu.Separator
              className="mx-3 bg-gray-100"
              style={{ height: "1px" }}
            />
            <DropdownMenu.Item
              onSelect={() => {
                handleLanguageChange(Language.DE);
              }}
            >
              <div className="flex w-40 cursor-pointer items-center py-3 pl-4">
                <div>
                  <img src={flagDeIcon} width={14} height={14} alt="German" />
                </div>
                <div className="pl-4 text-sm">German (DE)</div>
              </div>
            </DropdownMenu.Item>
            <DropdownMenu.Separator
              className="mx-3 bg-gray-100"
              style={{ height: "1px" }}
            />
            <DropdownMenu.Item
              onSelect={() => {
                handleLanguageChange(Language.FR);
              }}
            >
              <div className="flex w-40 cursor-pointer items-center py-3 pl-4">
                <div>
                  <img src={flagFrIcon} width={14} height={14} alt="French" />
                </div>
                <div className="pl-4 text-sm">French (FR)</div>
              </div>
            </DropdownMenu.Item>
            <DropdownMenu.Separator
              className="mx-3 bg-gray-100"
              style={{ height: "1px" }}
            />
            <DropdownMenu.Item
              onSelect={() => {
                handleLanguageChange(Language.IT);
              }}
            >
              <div className="flex w-40 cursor-pointer items-center py-3 pl-4">
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
        <div className="color-gray-700 flex h-6 items-center space-x-2 rounded border border-gray-300 bg-white py-1 px-1">
          <div className="text-2xs">{getTimeZoneAbv(selectedTimeZone)}</div>
          <div>
            <img src={arrowDownIcon} width={12} height={7} alt="" />
          </div>
        </div>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        className="color-gray-700 z-10 rounded bg-white"
        align="end"
        style={{ boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.10)" }}
      >
        {timeZones.map((tz, idx) => (
          <DropdownMenu.Item
            key={`${tz}-${idx}`}
            onSelect={() => changeSelectedTimeZone(tz)}
          >
            <div className="cursor-pointer bg-white px-3 py-1">
              <div className="text-xs">{getTimeZoneAbv(tz)}</div>
            </div>
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );

  return (
    <>
      <div className="w-100 flex items-center justify-between">
        <div>
          <span className="text-sm">Snippet Preview</span>
        </div>
        <div className="flex space-x-2 leading-none">
          <div>{timeZoneDropdown}</div>
          <div>{languageDropdown}</div>
        </div>
      </div>

      <div className="pt-2">
        <div className="h-48 overflow-auto rounded border border-gray-50 bg-white py-1 pl-3 pr-1">
          {!selectedSlots.length ? (
            <div className="flex justify-between">
              <div
                className="color-gray-200 text-sm"
                style={{ paddingTop: "2px" }}
              >
                Selected slots will appear here
              </div>
              {copyButton}
            </div>
          ) : (
            <div>
              <div className="flex justify-between pb-3">
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
                  <div className="text-xs-05 color-gray-700 pb-1" key={idx}>
                    {/* Day */}
                    <div className="font-bold">
                      {format(
                        convertToDate(firstEvent.start),
                        "MMMM d (EEEE)",
                        { locale, timeZone: selectedTimeZone },
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
                              convertToDate(start),
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
