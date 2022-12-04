import { DateFormat, IntroSentenceType } from "@agreeto/api/types";
import {
  DEFAULT_LANGUAGE_FORMAT,
  LANGUAGE_FORMATS,
  type LanguageFormatItem,
  extractTextFromSlots,
} from "@agreeto/calendar-core";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { addHours, format, startOfDay } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { HiCheckCircle } from "react-icons/hi";
import { TiArrowSortedDown } from "react-icons/ti";

import { trpcApi } from "~features/trpc/api/hooks";

// @ts-expect-error - svg's are not typed
import previewImage from "./../../assets/gmail-preview.svg";

export const Formatting = () => {
  const utils = trpcApi.useContext();
  const introSentenceRef = useRef<HTMLTextAreaElement>(null);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [dateFormatDropdownOpen, setDateFormatDropdownOpen] = useState(false);
  const [introSentenceFocused, setIntroSentenceFocused] = useState(false);
  const [canSave, setCanSave] = useState(false);
  const [introSentence, setIntroSentence] = useState<string>(
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

  const { data: formattings } = trpcApi.formatting.byCurrentUser.useQuery();
  const { mutate: updateFormatting, isLoading: isUpdating } =
    trpcApi.formatting.update.useMutation({
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
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <div className="h-10 bg-white color-gray-700 rounded border border-gray-200 w-64 flex py-1 px-3 justify-between items-center space-x-3 text-sm">
          <div className="flex space-x-3 items-center">
            <selectedLanguage.icon className="h-5 w-5" />
            <div>{selectedLanguage.title}</div>
          </div>

          <TiArrowSortedDown className="h-6 w-6 text-gray-600" />
        </div>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content
        className="z-10 bg-white color-gray-700 rounded mt-2"
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
            <div className="h-10 bg-white color-gray-700 w-64 flex py-1 px-3 justify-between space-x-3 cursor-pointer text-sm">
              <div className="flex space-x-3 items-center">
                <item.icon className="h-5 w-5" />
                <div>{item.title}</div>
              </div>
              {item.key === selectedLanguage.key && (
                <HiCheckCircle className="h-4 w-4 text-primary" />
              )}
            </div>
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );

  const introSentenceElem = (
    <div>
      <div className="flex border border-gray-100 rounded w-full h-9 overflow-hidden">
        {Object.values(IntroSentenceType)
          .map((type) => (
          <div
            key={type}
            className={`flex-1 cursor-pointer text-sm flex items-center justify-center ${
              introSentenceType === type
                ? "bg-primary text-white"
                : "bg-white color-[#3A3F46] hover:bg-gray-100"
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
          className="resize-none w-full rounded-lg px-4 py-3 text-sm border border-gray-200 disabled:cursor-not-allowed disabled:text-gray-300"
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
        <div className="h-10 bg-white color-gray-700 rounded border border-gray-200 w-64 flex py-1 px-3 justify-between space-x-3 items-center text-sm">
          <div>{format(new Date(), selectedDateFormat)}</div>
          <TiArrowSortedDown className="h-6 w-6 text-gray-600" />
        </div>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content
        className="z-10 bg-white color-gray-700 rounded mt-2"
        style={{ boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.10)" }}
        align="end"
      >
        {Object.values(DateFormat)
          .map((item) => (
          <DropdownMenu.Item
            key={item}
            onSelect={() => {
              if (item === selectedDateFormat) return;
              setSelectedDateFormat(item);
              setCanSave(true);
            }}
          >
            <div className="h-10 bg-white color-gray-700 w-64 flex py-1 px-3 justify-between space-x-3 cursor-pointer items-center text-sm">
              <div>{format(new Date(), item)}</div>
              {item === selectedDateFormat && (
                <HiCheckCircle className="h-4 w-4 text-primary" />
              )}
            </div>
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );

  return (
    <div className="flex space-x-6 justify-between">
      {/* Form */}
      <div className="mt-3">
        <div className="font-medium">Language</div>
        <div className="mt-3">{languageDropdown}</div>
        <div className="font-medium mt-10">Intro sentence</div>
        <div className="mt-3">{introSentenceElem}</div>
        <div className="font-medium mt-10">Date format</div>
        <div className="mt-3">{dateFormatDropdown}</div>
        <div className="mt-10">
          <button
            className="button w-full"
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
        <img src={previewImage} alt="preview" />
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
