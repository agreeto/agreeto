import { Language, UpdateFormSchema } from "@agreeto/api/client";
import { DateFormat, IntroSentenceType } from "@agreeto/api/client";
import {
  DEFAULT_LANGUAGE_FORMAT,
  LANGUAGE_FORMATS,
  type LanguageFormatItem,
  extractTextFromSlots,
} from "@agreeto/calendar-core";
import { Button } from "@agreeto/ui";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Select from "@radix-ui/react-select";
import { addHours, format, startOfDay } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { HiCheckCircle } from "react-icons/hi";
import { TiArrowSortedDown } from "react-icons/ti";
import { useValue, useZorm } from "react-zorm";

import { trpcApi } from "~features/trpc/api/hooks";

// @ts-expect-error - svg's are not typed
import previewImage from "../../../assets/gmail-preview.svg";

const getDateFormatByString = (format: string): DateFormat => {
  console.log("inc", format);
  switch (format) {
    case "EEEE_MM_dd_yyyy":
      return DateFormat.EEEE_MM_dd_yyyy;
    case "MM/DD/YY":
      return DateFormat.EEEE_M_d;
    case "YYYY/MM/DD":
      return DateFormat.EEE_MM_dd;
    case "MMMM_d_EEEE":
      return DateFormat.MMMM_d_EEEE;
    default:
      return DateFormat.EEEE_MM_dd_yyyy;
  }
};

export const Formatting = () => {
  const utils = trpcApi.useContext();
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [dateFormatDropdownOpen, setDateFormatDropdownOpen] = useState(false);
  const [introSentenceFocused, setIntroSentenceFocused] = useState(false);

  const { data: formattings } = trpcApi.formatting.byCurrentUser.useQuery();
  const { mutate: updateFormatting, isLoading: isUpdating } =
    trpcApi.formatting.update.useMutation({
      onSuccess() {
        utils.formatting.byCurrentUser.invalidate();
      },
    });

  //   useEffect(() => {
  //     const formatting = formattings?.find(
  //       (f) => f.language === selectedLanguage.key,
  //     );

  //     if (formatting) {
  //       setSelectedDateFormat(formatting.dateFormat);
  //       setSelectedLanguage(
  //         // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  //         LANGUAGE_FORMATS.find((i) => i.key === formatting.language)!,
  //       );
  //       setIntroSentenceType(formatting.introSentenceType);
  //     //   setIntroSentence(formatting.introSentence);
  //     } else {
  //       // Reset fields
  //       setSelectedDateFormat(DateFormat.MMMM_d_EEEE);
  //       setIntroSentenceType(IntroSentenceType.DEFAULT);
  //       resetIntroSentence(IntroSentenceType.DEFAULT);
  //     }
  //     // eslint-disable-next-line react-hooks/exhaustive-deps
  //   }, [selectedLanguage, formattings]);

  //   const resetIntroSentence = (type: IntroSentenceType) => {
  //     const lang = LANGUAGE_FORMATS.find(
  //       ({ key }) => key === selectedLanguage.key,
  //     );
  //     if (type === IntroSentenceType.NONE) {
  //       setIntroSentence("");
  //     } else {
  //       if (lang) {
  //         setIntroSentence(lang.defaultIntroSentence);
  //       }
  //     }
  //   };

  const zo = useZorm("update-formatting", UpdateFormSchema, {
    onValidSubmit(e) {
      e.preventDefault();
      updateFormatting(e.data);
    },
  });

  const dateFormat = useValue({
    zorm: zo,
    name: zo.fields.dateFormat(),
    initialValue: DateFormat.MMMM_d_EEEE,
  });
  const introSentence = useValue({
    zorm: zo,
    name: zo.fields.introSentence(),
    initialValue: DEFAULT_LANGUAGE_FORMAT.defaultIntroSentence,
  });
  const sentenceType = useValue({
    zorm: zo,
    name: zo.fields.introSentenceType(),
    initialValue: IntroSentenceType.DEFAULT,
  });
  const language = useValue({
    zorm: zo,
    name: zo.fields.language(),
    initialValue: Language.EN,
  });

  //   const languageDropdown = (
  //     <DropdownMenu.Root onOpenChange={setLanguageDropdownOpen}>
  //       <DropdownMenu.Trigger>
  //         <div className="h-10 bg-white color-gray-700 rounded border border-gray-200 w-64 flex py-1 px-3 justify-between items-center space-x-3 text-sm">
  //           <div className="flex space-x-3 items-center">
  //             <selectedLanguage.icon className="h-5 w-5" />
  //             <div>{selectedLanguage.title}</div>
  //           </div>

  //           <TiArrowSortedDown className="h-6 w-6 text-gray-600" />
  //         </div>
  //       </DropdownMenu.Trigger>

  //       <DropdownMenu.Content
  //         className="z-10 bg-white color-gray-700 rounded mt-2"
  //         style={{ boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.10)" }}
  //         align="end"
  //       >
  //         {LANGUAGE_FORMATS.map((item) => (
  //           <DropdownMenu.Item
  //             key={item.key}
  //             onSelect={() => {
  //               if (item.key === selectedLanguage.key) return;
  //               setSelectedLanguage(item);
  //               setCanSave(false);
  //             }}
  //           >
  //             <div className="h-10 bg-white color-gray-700 w-64 flex py-1 px-3 justify-between space-x-3 cursor-pointer text-sm">
  //               <div className="flex space-x-3 items-center">
  //                 <item.icon className="h-5 w-5" />
  //                 <div>{item.title}</div>
  //               </div>
  //               {item.key === selectedLanguage.key && (
  //                 <HiCheckCircle className="h-4 w-4 text-primary" />
  //               )}
  //             </div>
  //           </DropdownMenu.Item>
  //         ))}
  //       </DropdownMenu.Content>
  //     </DropdownMenu.Root>
  //   );

  const introSentenceElem = (
    <div>
      <div className="flex border border-gray-100 rounded w-full h-9 overflow-hidden">
        {Object.values(IntroSentenceType).map((type) => (
          //   <div
          //     key={type}
          //     className={`flex-1 cursor-pointer text-sm flex items-center justify-center ${
          //       introSentenceType === type
          //         ? "bg-primary text-white"
          //         : "bg-white color-[#3A3F46] hover:bg-gray-100"
          //     } ${
          //       type !== IntroSentenceType.NONE ? "border-r border-gray-100" : ""
          //     }`}
          //     onClick={() => {
          //       setIntroSentenceType(type);
          //       resetIntroSentence(type);
          //       setCanSave(true);
          //       if (type === IntroSentenceType.CUSTOM) {
          //         setTimeout(() => {
          //           introSentenceRef?.current?.focus();
          //         }, 10);
          //       }
          //     }}
          //   >
          //     {`${type.toUpperCase().substring(0, 1)}${type
          //       .toLowerCase()
          //       .slice(1)}`}
          //   </div>
          <>
            <label className="block text-sm font-medium text-gray-700">
              {type}
            </label>
            <input
              type="radio"
              name={zo.fields.introSentenceType()}
              value={type}
            />
          </>
        ))}
      </div>

      <div className="mt-3">
        <textarea
          className="resize-none w-full rounded-lg px-4 py-3 text-sm border border-gray-200 disabled:cursor-not-allowed disabled:text-gray-300"
          rows={4}
          name={zo.fields.introSentence()}
          //   value={introSentence}
          //   onChange={(e) => {
          //     setIntroSentence(e.target.value);
          //     setCanSave(true);
          //   }}
          //   disabled={introSentenceType !== IntroSentenceType.CUSTOM}
          //   ref={introSentenceRef}
          //   onFocus={() => {
          //     setIntroSentenceFocused(true);
          //   }}
          //   onBlur={() => {
          //     setIntroSentenceFocused(false);
          //   }}
        />
      </div>
    </div>
  );

  //   const dateFormatDropdown = (
  //     <DropdownMenu.Root onOpenChange={setDateFormatDropdownOpen}>
  //       <DropdownMenu.Trigger>
  //         <div className="h-10 bg-white color-gray-700 rounded border border-gray-200 w-64 flex py-1 px-3 justify-between space-x-3 items-center text-sm">
  //           <div>{format(new Date(), selectedDateFormat)}</div>
  //           <TiArrowSortedDown className="h-6 w-6 text-gray-600" />
  //         </div>
  //       </DropdownMenu.Trigger>

  //       <DropdownMenu.Content
  //         className="z-10 bg-white color-gray-700 rounded mt-2"
  //         style={{ boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.10)" }}
  //         align="end"
  //       >
  //         {Object.values(DateFormat).map((item) => (
  //           <DropdownMenu.Item
  //             key={item}
  //             onSelect={() => {
  //               if (item === selectedDateFormat) return;
  //               setSelectedDateFormat(item);
  //               setCanSave(true);
  //             }}
  //           >
  //             <div className="h-10 bg-white color-gray-700 w-64 flex py-1 px-3 justify-between space-x-3 cursor-pointer items-center text-sm">
  //               <div>{format(new Date(), item)}</div>
  //               {item === selectedDateFormat && (
  //                 <HiCheckCircle className="h-4 w-4 text-primary" />
  //               )}
  //             </div>
  //           </DropdownMenu.Item>
  //         ))}
  //       </DropdownMenu.Content>
  //     </DropdownMenu.Root>
  //   );

  //   const SelectLanguage = (
  //     <Select.Root>
  //       <Select.Trigger>
  //         <Select.Value />
  //         <Select.Icon />
  //       </Select.Trigger>
  //       <Select.Portal>
  //         <Select.Content>
  //             {LANGUAGE_FORMATS.map((item) => (
  //                 <Select.Option
  //                     key={item.key}
  //                     value={item.key}
  //                         >
  //         </Select.Content>
  //       </Select.Portal>
  //     </Select.Root>
  //   );

  return (
    <div className="flex pl-3 space-x-6 justify-between">
      {/* Form */}
      <form ref={zo.ref}>
        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700">
            Language
          </label>
          <select name={zo.fields.language()}>
            {LANGUAGE_FORMATS.map((item) => (
              <option key={item.key} value={item.key}>
                {item.title}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700">
            Date Format
          </label>
          <select name={zo.fields.dateFormat()}>
            {Object.values(DateFormat).map((item) => (
              <option key={item} value={item}>
                {format(new Date(), item)}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-3">{introSentenceElem}</div>
        <pre>
          {JSON.stringify(
            {
              language,
              dateFormat,
              introSentence,
              sentenceType,
            },
            null,
            2,
          )}
        </pre>
      </form>

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
                formatLanguage: language as Language,
                dateFormat: dateFormat as DateFormat,
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
