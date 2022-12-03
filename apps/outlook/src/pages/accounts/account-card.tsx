import type { RouterOutputs } from "@agreeto/api";
import { EventColorUserRadix } from "@agreeto/api/types";
import {
  Button,
  Dialog,
  DropdownMenu,
  GoogleLogo,
  MicrosoftLogo,
} from "@agreeto/ui";
import * as RadioGroup from "@radix-ui/react-radio-group";
import * as Tooltip from "@radix-ui/react-tooltip";
import type { FC } from "react";
import { AiOutlineMore } from "react-icons/ai";
import { HiCheckCircle } from "react-icons/hi";
// import resolveConfig from "tailwindcss/resolveConfig";

import { trpc } from "../../features/trpc/hooks";
// import tailwindConfig from "../../../tailwind.config";

// const fullConfig = resolveConfig({
//   ...tailwindConfig,
//   content: ["./src/**/*.{html,js,ts,tsx}"],
// });

// export const themeColors = fullConfig.theme?.colors as Record<
//   EventColorUserRadix & string,
//   Record<number, string>
// >;

type Account = RouterOutputs["user"]["myAccounts"]["accounts"][number];

export const AccountCard: FC<{
  account: Account;
}> = ({ account }) => {
  const initials = account.email?.substring(0, 2).toLocaleUpperCase();

  const { data: user } = trpc.user.me.useQuery();

  const utils = trpc.useContext();
  const { mutateAsync: updateEventColor } =
    trpc.account.updateColor.useMutation({
      onSuccess() {
        utils.account.me.invalidate();
        utils.event.all.invalidate();
        utils.user.myAccounts.invalidate();
        utils.user.me.invalidate();
      },
    });

  return (
    <Tooltip.Provider>
      <div className="h-30 flex justify-between space-x-4 rounded-lg border border-mauve-6 py-6 pr-6 pl-9">
        <div className="flex w-full gap-4">
          {/* Avatar w/ initials */}
          <div
            className="h-10 w-10 self-center rounded-full text-center leading-10"
            // style={{
            //   backgroundColor: themeColors[account.eventColor][7],
            //   color: themeColors[account.eventColor][11],
            // }}
          >
            {initials}
          </div>
          {/* Email, Colors & Badges */}
          <div className="flex flex-grow flex-col items-start px-10 ">
            {/* this div makes sure that the children have the same width as determined by colors radio group */}
            <div>
              {/* Email and organizer badge */}
              <div className="flex justify-between">
                <div className="flex items-center gap-2 text-sm font-normal leading-5">
                  {account.provider === "google" ? (
                    <GoogleLogo className="h-4 w-4" />
                  ) : (
                    <MicrosoftLogo className="h-4 w-4" />
                  )}
                  {account.email}
                </div>
                {user?.accountPrimaryId === account.id && (
                  <Tooltip.Root delayDuration={300}>
                    <Tooltip.Trigger asChild>
                      <div className="cursor-help rounded bg-blue-9 px-2 py-0.5 text-xs text-white">
                        Organizer
                      </div>
                    </Tooltip.Trigger>
                    <Tooltip.Content
                      align="end"
                      side="right"
                      sideOffset={10}
                      className="z-10"
                    >
                      <div className="w-[350] rounded-lg bg-white px-5 py-6 shadow-2xl">
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
                <div className="flex space-x-4 pt-4">
                  {Object.values(EventColorUserRadix).map((eventColor, ix) => {
                    return (
                      <RadioGroup.Item
                        key={ix}
                        value={eventColor}
                        className="relative h-[2.25rem] w-[2.25rem] cursor-pointer rounded border"
                        onClick={() =>
                          updateEventColor({
                            id: account.id,
                            eventColor,
                          })
                        }
                        // style={{
                        //   backgroundColor: themeColors[eventColor][7],
                        //   borderColor: themeColors[eventColor][11],
                        // }}
                      >
                        <RadioGroup.Indicator asChild>
                          <HiCheckCircle
                            className="absolute bottom-[2px] right-[2px] h-3.5 w-3.5"
                            // style={{ fill: themeColors[eventColor][11] }}
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
  const utils = trpc.useContext();

  const { mutate: changePrimary } = trpc.user.changePrimary.useMutation({
    onSuccess() {
      utils.account.primary.invalidate();
      utils.account.me.invalidate();
      utils.user.me.invalidate();
      utils.user.myAccounts.invalidate();
    },
  });

  const { data: user } = trpc.user.me.useQuery();
  const isPrimary = user?.accountPrimaryId === account.id;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="ml-auto flex h-8 w-8 cursor-pointer items-center justify-center self-center hover:rounded-md hover:bg-mauve-3"
          aria-label="Customise options"
        >
          <AiOutlineMore className="h-6 w-6" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content sideOffset={5} side="left" align="start">
          <DropdownMenu.Item asChild>
            <Button
              variant="glass"
              className="flex w-full justify-evenly leading-6 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isPrimary}
              onClick={() => changePrimary({ id: account.id })}
            >
              <HiCheckCircle className="h-4 w-4" />
              <div>Set as organizer</div>
            </Button>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild>
            <RemoveAccountAlertDialog account={account} isPrimary={isPrimary} />
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

const RemoveAccountAlertDialog = ({
  account,
  isPrimary,
}: {
  account: Account;
  isPrimary: boolean;
}) => {
  const utils = trpc.useContext();

  const { mutate: removeAccount } = trpc.account.delete.useMutation({
    onSuccess() {
      utils.user.myAccounts.invalidate();
      utils.account.primary.invalidate();
    },
  });

  return (
    <Dialog>
      <Dialog.Trigger
        disabled={isPrimary}
        variant="glass"
        className="flex w-full justify-evenly leading-6 text-red-7 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <HiCheckCircle className="h-4 w-4" />
        <div>Remove Account</div>
      </Dialog.Trigger>
      <Dialog.Body variant="error">
        {/* Header */}
        <Dialog.Header>
          <Dialog.Icon variant="error" />
          <Dialog.Title>Remove Account</Dialog.Title>
        </Dialog.Header>

        {/* Description */}
        <Dialog.Description>
          Are you sure you want to delete your account?
        </Dialog.Description>

        {/* Footer */}
        <Dialog.Footer>
          <Dialog.Cancel variant="glass">Cancel</Dialog.Cancel>
          <Dialog.Action
            variant="error"
            onClick={() => removeAccount({ id: account.id })}
          >
            Yes, confirm me
          </Dialog.Action>
        </Dialog.Footer>
      </Dialog.Body>
    </Dialog>
  );
};
