import type { RouterOutputs } from "@agreeto/api";
import { EventColorRadix } from "@agreeto/api/types";
import { AlertDialog, Button, DropdownMenu } from "@agreeto/ui";
import * as RadioGroup from "@radix-ui/react-radio-group";
import * as Tooltip from "@radix-ui/react-tooltip";
import type { FC, ReactNode } from "react";
import React from "react";
import { AiOutlineMore } from "react-icons/ai";
import { HiCheckCircle, HiOutlineExclamation, HiTrash } from "react-icons/hi";
import resolveConfig from "tailwindcss/resolveConfig";

import { trpcApi } from "~features/trpc/api/hooks";

import tailwindConfig from "./../../../tailwind.config";

const fullConfig = resolveConfig({
  ...tailwindConfig,
  content: ["./src/**/*.{html,js,ts,tsx}"],
});

export const themeColors = fullConfig.theme?.colors as Record<
  EventColorRadix & string,
  string
>;

type Account = RouterOutputs["user"]["myAccounts"]["accounts"][number];

const AccountCard: FC<{
  account: Account;
}> = ({ account }) => {
  const initials = account.email?.substring(0, 2).toLocaleUpperCase();

  const { data: user } = trpcApi.user.me.useQuery();

  const utils = trpcApi.useContext();
  const { mutateAsync: updateEventColor } =
    trpcApi.account.updateColor.useMutation({
      onSuccess() {
        utils.account.me.invalidate();
        utils.event.all.invalidate();
        utils.user.myAccounts.invalidate();
        utils.user.me.invalidate();
      },
    });

  return (
    <Tooltip.Provider>
      <div className="flex justify-between py-6 pr-6 space-x-4 border rounded-lg h-30 border-mauve-6 pl-9">
        <div className="flex w-full gap-4">
          {/* Avatar w/ initials */}
          <div
            className="self-center w-10 h-10 leading-10 text-center rounded-full"
            style={{
              backgroundColor: themeColors?.[account.eventColor][7],
              color: themeColors?.[account.eventColor][11],
            }}
          >
            {initials}
          </div>
          {/* Email, Colors & Badges */}
          <div className="flex flex-col items-start flex-grow px-10 ">
            {/* this div makes sure that the children have the same width as determined by colors radio group */}
            <div>
              {/* Email and organizer badge */}
              <div className="flex justify-between">
                <div className="text-sm font-normal leading-5">
                  {account.email}
                </div>
                {user?.accountPrimaryId === account.id && (
                  <Tooltip.Root delayDuration={300}>
                    <Tooltip.Trigger asChild>
                      <div className="px-2 py-0.5 text-xs text-white rounded bg-blue-9 cursor-help">
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
              {/* Change account color action */}
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
                          <HiCheckCircle
                            className="w-3.5 h-3.5 absolute bottom-[2px] right-[2px]"
                            style={{ fill: themeColors[eventColor][11] }}
                          />
                        </RadioGroup.Indicator>
                      </RadioGroup.Item>
                    );
                  })}
                </div>
              </RadioGroup.Root>
            </div>
          </div>
          {/* More Actions via dropdown */}
          <MoreAccountActionsDropdownMenu account={account} />
        </div>
      </div>
    </Tooltip.Provider>
  );
};

const MoreAccountActionsDropdownMenu = ({ account }: { account: Account }) => {
  const utils = trpcApi.useContext();

  const { mutate: changePrimary } = trpcApi.user.changePrimary.useMutation({
    onSuccess() {
      utils.account.primary.invalidate();
      utils.account.me.invalidate();
      utils.user.me.invalidate();
      utils.user.myAccounts.invalidate();
    },
  });

  const { data: user } = trpcApi.user.me.useQuery();
  const isPrimary = user?.accountPrimaryId === account.id;


  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="flex items-center self-center justify-center w-8 h-8 ml-auto cursor-pointer hover:bg-mauve-3 hover:rounded-md"
          aria-label="Customise options"
        >
          <AiOutlineMore className="w-6 h-6" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content sideOffset={5} side="left" align="start">
          <DropdownMenu.Item asChild>
            <Button
              variant="glass"
              className="flex w-full leading-6 justify-evenly disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isPrimary}
              onClick={() => changePrimary({ id: account.id })}
            >
              <HiCheckCircle className="w-4 h-4" />
              <div>Set as organizer</div>
            </Button>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild>
            <RemoveAccountAlertDialog account={account}>
              <Button
                variant="glass"
                className="flex w-full leading-6 justify-evenly text-red-9 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isPrimary}
              >
                <HiTrash className="w-4 h-4" />
                <div>Remove account</div>
              </Button>
            </RemoveAccountAlertDialog>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

const RemoveAccountAlertDialog = ({
  account,
  children,
}: {
  account: Account;
  children: ReactNode;
}) => {
  const utils = trpcApi.useContext();

  const { mutate: removeAccount } = trpcApi.account.delete.useMutation({
    onSuccess() {
      utils.user.myAccounts.invalidate();
      utils.account.primary.invalidate();
    },
  });

  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>{children}</AlertDialog.Trigger>
      <AlertDialog.Body>
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
      </AlertDialog.Body>
    </AlertDialog.Root>
  );
};

export default AccountCard;
