import { Language, UpdateFormSchema } from "@agreeto/api/client";
import { DateFormat, IntroSentenceType } from "@agreeto/api/client";
import {
  DEFAULT_LANGUAGE_FORMAT,
  LANGUAGE_FORMATS,
  extractTextFromSlots,
} from "@agreeto/calendar-core";
import { Button } from "@agreeto/ui";
import * as Select from "@radix-ui/react-select";
import clsx from "clsx";
import { addHours, format, startOfDay } from "date-fns";
import { useEffect } from "react";
import { HiCheckCircle } from "react-icons/hi";
import { TiArrowSortedDown } from "react-icons/ti";
import { useValue, useZorm } from "react-zorm";

import { trpcApi } from "~features/trpc/api/hooks";

// @ts-expect-error - svg's are not typed
import previewImage from "../../../assets/gmail-preview.svg";

export const Formatting = () => {
  const utils = trpcApi.useContext();

  const zo = useZorm("update-formatting", UpdateFormSchema, {
    onValidSubmit(e) {
      e.preventDefault();
      console.log("FormData:", e.data);
      //   updateFormatting(e.data);
    },
  });

  const language = useValue({
    zorm: zo,
    name: zo.fields.language(),
    initialValue: Language.EN,
  });

  const { data: formatting } = trpcApi.formatting.byLanguage.useQuery({
    language,
  });
  const { mutate: updateFormatting } = trpcApi.formatting.update.useMutation({
    onSuccess() {
      utils.formatting.byCurrentUser.invalidate();
    },
  });

  const dateFormat = useValue({
    zorm: zo,
    name: zo.fields.dateFormat(),
    initialValue: formatting?.dateFormat ?? DateFormat.MMMM_d_EEEE,
  });
  const introSentence = useValue({
    zorm: zo,
    name: zo.fields.introSentence(),
    initialValue:
      formatting?.introSentence ?? DEFAULT_LANGUAGE_FORMAT.defaultIntroSentence,
  });
  const sentenceType = useValue({
    zorm: zo,
    name: zo.fields.introSentenceType(),
    initialValue: formatting?.introSentenceType ?? IntroSentenceType.DEFAULT,
  });

  // Reset introSentence type when sentenceType changes
  useEffect(() => {
    console.log(zo.fields.introSentenceType("id"));
  }, [sentenceType]);

  return (
    <div className="flex pl-3 space-x-6 justify-between gap-3">
      {/* Form */}
      <div>
        <form ref={zo.ref}>
          {/* Language Selector */}
          {/* TODO: Abstract out */}
          <div>
            <label
              htmlFor={zo.fields.language("id")}
              className="block text-sm font-medium text-gray-700"
            >
              Language
            </label>
            <Select.Root
              defaultValue={language}
              name={zo.fields.language("name")}
              onValueChange={(value) => {
                console.log("Lang onChange", value);
              }}
            >
              <Select.Trigger className="h-10 bg-white text-gray-700 rounded border border-gray-200 w-64 flex justify-between items-center py-1 px-3 gap-3 cursor-pointer text-sm">
                <Select.Value aria-label={language}>{language}</Select.Value>
                <Select.Icon asChild>
                  <TiArrowSortedDown className="w-4 text-gray-700" />
                </Select.Icon>
              </Select.Trigger>

              <Select.Portal>
                <Select.Content className="overflow-hidden bg-white rounded text-gray-700 mt-2">
                  <Select.Viewport className="p-2">
                    {LANGUAGE_FORMATS.map((item) => (
                      <Select.Item
                        key={item.key}
                        value={item.key}
                        className="flex"
                      >
                        <Select.ItemText className="inline-flex gap-2 h-10 w-64 py-1 px-3 justify-between space-x-3 cursor-pointer items-center text-sm">
                          <item.icon className="h-5 w-5" />
                          <p>{item.key}</p>
                        </Select.ItemText>
                        <Select.ItemIndicator className="SelectItemIndicator">
                          <HiCheckCircle className="h-5 w-5 text-primary" />
                        </Select.ItemIndicator>
                      </Select.Item>
                    ))}
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
          </div>

          {/* DateFormat Selector */}
          {/* <div>
            <label className="block text-sm font-medium text-gray-700">
              Date Format
            </label>
            <Select.Root
              defaultValue={language}
              //   name={zo.fields.language("name")}
              onValueChange={(value) => {
                console.log(value);
              }}
            >
              <Select.Trigger
                className={clsx(
                  "h-10 bg-white text-gray-700 rounded border border-gray-200 w-64 flex justify-between items-center py-1 px-3 gap-3 cursor-pointer text-sm",
                )}
              >
                <Select.Value aria-label={language}>{language}</Select.Value>
                <Select.Icon asChild>
                  <TiArrowSortedDown className="w-4 text-gray-700" />
                </Select.Icon>
              </Select.Trigger>

              <Select.Portal>
                <Select.Content className="overflow-hidden bg-white rounded text-gray-700 mt-2 border border-gray-100">
                  <Select.Viewport className="p-2">
                    {Object.values(DateFormat).map((item) => (
                      <Select.Item key={item} value={item} className="flex">
                        <Select.ItemText className="inline-flex gap-2 h-10 w-64 py-1 px-3 justify-between space-x-3 cursor-pointer items-center text-sm">
                          {format(new Date(), item)}
                        </Select.ItemText>
                        <Select.ItemIndicator className="SelectItemIndicator">
                          <HiCheckCircle className="h-5 w-5 text-primary" />
                        </Select.ItemIndicator>
                      </Select.Item>
                    ))}
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
          </div> */}

          {/* IntroSentenceType Radio Group + Textarea */}
          {/* <div className="mt-3">
            <div className="flex border border-gray-100 rounded w-full h-9 overflow-hidden">
              {Object.values(IntroSentenceType).map((type, i) => (
                <label
                  className={clsx(
                    "flex-1 cursor-pointer text-sm flex items-center justify-center",
                    sentenceType === type
                      ? "bg-primary text-white"
                      : "bg-white text-gray-900",
                    i !== Object.values(IntroSentenceType).length - 1 &&
                      "border-r border-gray-100",
                  )}
                  htmlFor={type}
                >
                  {type.substring(0, 1).toUpperCase() +
                    type.substring(1).toLowerCase()}
                  <input
                    type="radio"
                    className="hidden"
                    id={type}
                    name={zo.fields.introSentenceType()}
                    value={type}
                  />
                </label>
              ))}
            </div>

            <div className="mt-3">
              <textarea
                className="resize-none w-full rounded-lg px-4 py-3 text-sm border border-gray-200 disabled:cursor-not-allowed disabled:text-gray-300"
                rows={4}
                name={zo.fields.introSentence()}
                defaultValue={
                  sentenceType === IntroSentenceType.DEFAULT
                    ? LANGUAGE_FORMATS.find((item) => item.key === language)
                        ?.defaultIntroSentence
                    : sentenceType === IntroSentenceType.CUSTOM
                    ? introSentence
                    : ""
                }
                disabled={sentenceType !== IntroSentenceType.CUSTOM}
              />
            </div>
          </div> */}

          {/* Submit Button */}
          <div className="mt-3">
            <Button type="submit" className="w-full">
              <span>Save</span>
            </Button>
          </div>

          <pre>Validation status: {JSON.stringify(zo.validation, null, 2)}</pre>
        </form>
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
                formatLanguage: language,
                dateFormat: dateFormat,
                copyTitle: introSentence,
                highlight: {
                  // TODO: Can we use the ref or smth?
                  //   date: languageDropdownOpen || dateFormatDropdownOpen,
                  //   introSentence: languageDropdownOpen || introSentenceFocused,
                  //   time: languageDropdownOpen,
                },
              },
            ),
          }}
        />
      </div>
    </div>
  );
};
