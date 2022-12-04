/* eslint-disable @typescript-eslint/ban-ts-comment */

/* eslint-disable react-hooks/exhaustive-deps */

/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { DateFormat, IntroSentenceType } from "@agreeto/api/types";
import {
  DEFAULT_LANGUAGE_FORMAT,
  LANGUAGE_FORMATS,
  type LanguageFormatItem,
  extractTextFromSlots,
} from "@agreeto/calendar-core";

import { DropdownMenu } from "@agreeto/ui";
import { addHours, format, startOfDay } from "date-fns";
import { useEffect, useRef, useState } from "react";

import { trpc } from "../utils/trpc";

// @ts-ignore
// import arrowDownIcon from "./../../assets/arrow-down.svg";
// @ts-ignore
// import checkMarkBlueIcon from "./../../assets/check-mark-blue.svg";

import { GmailCompose } from "@agreeto/ui";

// import { client } from "~features/trpc/chrome/client";

export const Formatting = () => {
  const utils = trpc.useContext();
  const introSentenceRef = useRef<HTMLTextAreaElement>(null);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [dateFormatDropdownOpen, setDateFormatDropdownOpen] = useState(false);
  const [introSentenceFocused, setIntroSentenceFocused] = useState(false);
  const [canSave, setCanSave] = useState(false);
  const [introSentence, setIntroSentence] = useState(
    DEFAULT_LANGUAGE_FORMAT.defaultIntroSentence,
  );
  const [introSentenceType, setIntroSentenceType] = useState<IntroSentenceType>(
    IntroSentenceType.DEFAULT,
  );
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageFormatItem>(
    DEFAULT_LANGUAGE_FORMAT,
  );
  const [selectedDateFormat, setSelectedDateFormat] = useState<DateFormat>(
    DateFormat.MMMM_d_EEEE,
  );

  const { data: formattings } = trpc.formatting.byCurrentUser.useQuery();
  const { mutate: updateFormatting, isLoading: isUpdating } =
    trpc.formatting.update.useMutation({
      onSuccess() {
        utils.formatting.byCurrentUser.invalidate();
      },
    });

  useEffect(() => {
    const formatting = formattings?.find(
      (f) => f.language === selectedLanguage.key,
    );

    if (formatting) {
      setSelectedDateFormat(formatting.dateFormat);
      setSelectedLanguage(
        LANGUAGE_FORMATS.find((i) => i.key === formatting.language)!,
      );
      setIntroSentenceType(formatting.introSentenceType);
      setIntroSentence(formatting.introSentence);
    } else {
      // Reset fields
      setSelectedDateFormat(DateFormat.MMMM_d_EEEE);
      setIntroSentenceType(IntroSentenceType.DEFAULT);
      resetIntroSentence(IntroSentenceType.DEFAULT);
    }
  }, [selectedLanguage, formattings]);

  const resetIntroSentence = (type: IntroSentenceType) => {
    const lang = LANGUAGE_FORMATS.find(
      ({ key }) => key === selectedLanguage.key,
    );
    if (type === IntroSentenceType.NONE) {
      setIntroSentence("");
    } else {
      if (lang) {
        setIntroSentence(lang.defaultIntroSentence);
      }
    }
  };

  const languageDropdown = (
    <DropdownMenu.Root onOpenChange={setLanguageDropdownOpen}>
      <DropdownMenu.Trigger>
        <div className="flex justify-between w-64 h-10 px-3 py-1 space-x-3 text-sm bg-white border border-gray-200 rounded color-gray-700">
          <div className="flex items-center space-x-3">
            <div>
              <img
                src={selectedLanguage.icon}
                alt="lng"
                width={14}
                height={14}
              />
            </div>
            <div>{selectedLanguage.title}</div>
          </div>
          <div className="flex items-center">
            Arrow down
            {/* <img src={arrowDownIcon} alt="arrow" width={12} height={7} /> */}
          </div>
        </div>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content
        className="z-10 mt-2 bg-white rounded color-gray-700"
        style={{ boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.10)" }}
        align="end"
      >
        {LANGUAGE_FORMATS.map((item) => (
          <DropdownMenu.Item
            key={item.key}
            onSelect={() => {
              if (item.key === selectedLanguage.key) return;
              setSelectedLanguage(item);
              setCanSave(false);
            }}
          >
            <div className="flex justify-between w-64 h-10 px-3 py-1 space-x-3 text-sm bg-white cursor-pointer color-gray-700">
              <div className="flex items-center space-x-3">
                <div>
                  <img src={item.icon} alt="lng" width={14} height={14} />
                </div>
                <div>{item.title}</div>
              </div>
              {item.key === selectedLanguage.key && (
                <div className="flex items-center">
                  checkmark blue
                  {/* <img src={checkMarkBlueIcon} alt="" width={12} height={7} /> */}
                </div>
              )}
            </div>
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );

  const introSentenceElem = (
    <div>
      <div className="flex w-full overflow-hidden border border-gray-100 rounded h-9">
        {[
          IntroSentenceType.DEFAULT,
          IntroSentenceType.CUSTOM,
          IntroSentenceType.NONE,
        ].map((type) => (
          <div
            key={type}
            className={`flex flex-1 cursor-pointer items-center justify-center text-sm ${
              introSentenceType === type
                ? "bg-primary text-white"
                : "color-[#3A3F46] bg-white hover:bg-gray-100"
            } ${
              type !== IntroSentenceType.NONE ? "border-r border-gray-100" : ""
            }`}
            onClick={() => {
              setIntroSentenceType(type);
              resetIntroSentence(type);
              setCanSave(true);
              if (type === IntroSentenceType.CUSTOM) {
                setTimeout(() => {
                  introSentenceRef?.current?.focus();
                }, 10);
              }
            }}
          >
            {`${type.toUpperCase().substring(0, 1)}${type
              .toLowerCase()
              .slice(1)}`}
          </div>
        ))}
      </div>

      <div className="mt-3">
        <textarea
          className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg resize-none disabled:cursor-not-allowed disabled:text-gray-300"
          rows={4}
          value={introSentence}
          onChange={(e) => {
            setIntroSentence(e.target.value);
            setCanSave(true);
          }}
          disabled={introSentenceType !== IntroSentenceType.CUSTOM}
          ref={introSentenceRef}
          onFocus={() => {
            setIntroSentenceFocused(true);
          }}
          onBlur={() => {
            setIntroSentenceFocused(false);
          }}
        />
      </div>
    </div>
  );

  const dateFormatDropdown = (
    <DropdownMenu.Root onOpenChange={setDateFormatDropdownOpen}>
      <DropdownMenu.Trigger>
        <div className="flex items-center justify-between w-64 h-10 px-3 py-1 space-x-3 text-sm bg-white border border-gray-200 rounded color-gray-700">
          <div>{format(new Date(), selectedDateFormat)}</div>
          <div className="flex items-center">
            <img src={arrowDownIcon} alt="arrow" width={12} height={7} />
          </div>
        </div>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content
        className="z-10 mt-2 bg-white rounded color-gray-700"
        style={{ boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.10)" }}
        align="end"
      >
        {[
          DateFormat.MMMM_d_EEEE,
          DateFormat.MM_dd_yyyy,
          DateFormat.yyyy_MM_dd,
          DateFormat.MMMM_dd_yyyy,
          DateFormat.EEEE_MM_dd_yyyy,
          DateFormat.MMM_dd_EEEE,
          DateFormat.EEEE_M_d,
          DateFormat.EEE_MM_dd,
        ].map((item) => (
          <DropdownMenu.Item
            key={item}
            onSelect={() => {
              if (item === selectedDateFormat) return;
              setSelectedDateFormat(item);
              setCanSave(true);
            }}
          >
            <div className="flex items-center justify-between w-64 h-10 px-3 py-1 space-x-3 text-sm bg-white cursor-pointer color-gray-700">
              <div>{format(new Date(), item)}</div>
              {item === selectedDateFormat && (
                <div className="flex items-center">
                  <img src={checkMarkBlueIcon} alt="" width={12} height={7} />
                </div>
              )}
            </div>
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );

  return (
    <div className="flex justify-between space-x-6">
      {/* Form */}
      <div className="mt-3">
        <div className="font-medium">Language</div>
        <div className="mt-3">{languageDropdown}</div>
        <div className="mt-10 font-medium">Intro sentence</div>
        <div className="mt-3">{introSentenceElem}</div>
        <div className="mt-10 font-medium">Date format</div>
        <div className="mt-3">{dateFormatDropdown}</div>
        <div className="mt-10">
          <button
            className="w-full button"
            disabled={!canSave || isUpdating}
            onClick={() => {
              updateFormatting({
                dateFormat: selectedDateFormat,
                introSentence,
                introSentenceType,
                language: selectedLanguage.key,
              });
            }}
          >
            Save
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="relative flex">
        <GmailCompose className="compose-preview" />

        {/* <img src={GmailCompose} alt="preview" /> */}
        <div
          className="absolute whitespace-pre"
          style={{ top: "39%", left: "5%", fontSize: "0.9vw" }}
          dangerouslySetInnerHTML={{
            __html: extractTextFromSlots(
              [
                {
                  start: addHours(startOfDay(new Date()), 10),
                  end: addHours(startOfDay(new Date()), 11),
                },
                {
                  start: addHours(startOfDay(new Date()), 15),
                  end: addHours(startOfDay(new Date()), 16),
                },
              ],
              {
                formatLanguage: selectedLanguage.key,
                dateFormat: selectedDateFormat,
                copyTitle: introSentence,
                highlight: {
                  date: languageDropdownOpen || dateFormatDropdownOpen,
                  introSentence: languageDropdownOpen || introSentenceFocused,
                  time: languageDropdownOpen,
                },
              },
            ),
          }}
        />
      </div>
    </div>
  );
};

export default Formatting;
