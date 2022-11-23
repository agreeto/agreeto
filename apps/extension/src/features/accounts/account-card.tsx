import type { RouterOutputs } from "@agreeto/api";
import { EventColorRadix } from "@agreeto/api/types";
import { Button } from "@agreeto/ui";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as RadioGroup from "@radix-ui/react-radio-group";
import * as Tooltip from "@radix-ui/react-tooltip";
import type { FC } from "react";
import React from "react";
import { AiOutlineMore } from "react-icons/ai";
import { HiCheckCircle, HiOutlineExclamation, HiTrash } from "react-icons/hi";
import resolveConfig from "tailwindcss/resolveConfig";

import { trpcApi } from "~features/trpc/api/hooks";

// import type { IAccount } from "services/types";
import tailwindConfig from "./../../../tailwind.config";

type Account = RouterOutputs["account"]["me"][number];

const AccountCard: FC<{
  account: Account;
}> = ({ account }) => {
  const initials = account.email?.substring(0, 2).toLocaleUpperCase();

  const fullConfig = resolveConfig({
    ...tailwindConfig,
    content: ["./src/**/*.{html,js,ts,tsx}"],
  });
  const themeColors = fullConfig.theme?.colors;

  const utils = trpcApi.useContext();
  const { mutateAsync: updateEventColor } =
    trpcApi.account.updateColor.useMutation({
      onSuccess() {
        utils.account.me.invalidate();
        utils.event.all.invalidate();
      },
    });
  return (
    <Tooltip.Provider>
      <div className="flex justify-between py-6 pr-6 space-x-4 border rounded-lg h-30 border-mauve-6 pl-9">
        {/* Info */}
        <div className="flex w-full gap-4">
          {/* Avatar */}
          <div
            className="self-center w-10 h-10 leading-10 text-center rounded-full"
            style={{
              backgroundColor: themeColors[account.eventColor][7],
              color: themeColors[account.eventColor][11],
            }}
          >
            {initials}
          </div>
          {/* Email, Colors & Badges */}
          {/* <div className="flex flex-grow"> */}
          <div className="flex flex-col items-start flex-grow px-10 ">
            {/* this div makes sure that the children have the same width as determined by colors */}
            <div>
              <div className="flex justify-between">
                {/* a div displaying the email on the left side and a conditional organizer badge on the right */}
                <div className="text-sm font-normal">{account.email}</div>
                {account.userPrimary?.accountPrimaryId === account.id && (
                  <Tooltip.Root delayDuration={300}>
                    <Tooltip.Trigger asChild>
                      <div className="px-2 py-1 text-xs text-white rounded bg-blue-9 cursor-help">
                        Organizer
                      </div>
                    </Tooltip.Trigger>
                    <Tooltip.Content
                      align="end"
                      side="right"
                      sideOffset={10}
                      className="z-10"
                    >
                      <div className="px-5 py-6 bg-white rounded-lg shadow-2xl w-[350]">
                        <div className="font-semibold">Organizer Account</div>
                        <div className="pt-2">
                          The selected account will be the organizer for all
                          events created.
                        </div>
                      </div>
                    </Tooltip.Content>
                  </Tooltip.Root>
                )}
              </div>
              <RadioGroup.Root asChild defaultValue={account?.eventColor}>
                <div className="flex pt-4 space-x-4">
                  {Object.values(EventColorRadix).map((eventColor, ix) => {
                    return (
                      <RadioGroup.Item
                        key={ix}
                        value={eventColor}
                        className="relative w-[2.25rem] h-[2.25rem] border rounded cursor-pointer"
                        onClick={(e) =>
                          updateEventColor({
                            id: account.id,
                            eventColor: e.target.value,
                          })
                        }
                        style={{
                          backgroundColor: themeColors[eventColor][7],
                          borderColor: themeColors[eventColor][11],
                        }}
                      >
                        <RadioGroup.Indicator asChild>
                          <div className="absolute bottom-[2px] right-[2px] flex">
                            <span className="inline-block w-3.5 h-3.5 -rotate-[140deg]">
                              <div
                                id="circle"
                                className="absolute w-3.5 h-3.5 rounded-xl  left-[1px] top-[1px]"
                                style={{
                                  backgroundColor: themeColors[eventColor][11],
                                }}
                              ></div>
                              <div
                                id="checkmark-stem"
                                className="w-[1px] h-[8px] absolute top-[5px] left-1.5"
                                style={{
                                  backgroundColor: themeColors[eventColor][7],
                                }}
                              ></div>
                              <div
                                id="checkmark-kick"
                                className="w-[5px] h-[1px] absolute top-[4px] left-1.5"
                                style={{
                                  backgroundColor: themeColors[eventColor][7],
                                }}
                              ></div>
                            </span>
                          </div>
                        </RadioGroup.Indicator>
                      </RadioGroup.Item>
                    );
                  })}
                </div>
              </RadioGroup.Root>
            </div>
          </div>
          {/* Actions */}
          <ActionsDropdownMenu account={account} />
        </div>
      </div>
    </Tooltip.Provider>
  );
};

const ActionsDropdownMenu = ({ account }: { account: Account }) => {
  const utils = trpcApi.useContext();

  const { mutate: changePrimary } = trpcApi.user.changePrimary.useMutation({
    onSuccess() {
      utils.account.primary.invalidate();
      utils.account.me.invalidate();
      utils.user.me.invalidate();
    },
  });
  const { mutate: removeAccount } = trpcApi.account.delete.useMutation({
    onSuccess() {
      utils.account.me.invalidate();
    },
  });

  const isPrimary = account.userPrimary?.accountPrimaryId === account.id;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="flex items-center self-center justify-center w-8 h-8 ml-auto cursor-pointer hover:bg-gray-100 hover:rounded-md"
          aria-label="Customise options"
        >
          <AiOutlineMore className="w-6 h-6" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="absolute right-0 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg w-52 ring-1 ring-black ring-opacity-5 focus:outline-none"
          sideOffset={5}
          side="left"
          align="start"
        >
          <DropdownMenu.Item asChild>
            <button
              className="flex items-center w-full px-4 py-3 space-x-2 font-medium border-b border-mauve-6 disabled:cursor-not-allowed disabled:opacity-50 enabled:hover:bg-gray-100"
              disabled={isPrimary}
              onClick={() => changePrimary({ id: account.id })}
            >
              <HiCheckCircle className="w-4 h-4" />
              <div>Set as organizer</div>
            </button>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild>
            <AlertDialog.Root>
              <AlertDialog.Trigger asChild>
                <button
                  className="py-3 w-full px-4 text-[#D90026] font-medium flex space-x-2 items-center disabled:cursor-not-allowed disabled:opacity-50 hover:bg-gray-100"
                  disabled={isPrimary}
                  onClick={() => <></>}
                >
                  <HiTrash className="w-4 h-4" />
                  <div>Remove account</div>
                </button>
              </AlertDialog.Trigger>
              <AlertDialog.Portal>
                <AlertDialog.Overlay className="fixed inset-0 transition-opacity opacity-80 bg-blackA-9" />
                <AlertDialog.Content className="fixed w-3/5 -translate-x-1/2 -translate-y-1/2 bg-white rounded-md shadow-sm top-1/2 left-1/2 shadow-transparent l-1/2">
                  {/* dialog body */}
                  <div className="flex items-center justify-center p-3 mb-5 sm:flex sm:items-start">
                    <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-red-100 rounded-full sm:mx-0 sm:h-10 sm:w-10">
                      <HiOutlineExclamation className="w-5 h-5 stroke-red-9" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3
                        className="text-lg font-medium leading-6 text-gray-900"
                        id="modal-title"
                      >
                        Are you sure you want to remove this account?
                      </h3>
                    </div>
                  </div>
                  {/* dialog footer */}
                  <div className="flex justify-end gap-6 p-3 bg-mauve-2">
                    <AlertDialog.Cancel asChild>
                      <Button variant="glass">Cancel</Button>
                    </AlertDialog.Cancel>
                    <AlertDialog.Action asChild>
                      <Button
                        variant="error"
                        onClick={() => removeAccount({ id: account.id })}
                      >
                        Yes, remove
                      </Button>
                    </AlertDialog.Action>
                  </div>
                </AlertDialog.Content>
              </AlertDialog.Portal>
            </AlertDialog.Root>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default AccountCard;
