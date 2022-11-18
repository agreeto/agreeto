import { Button } from "@agreeto/ui";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Tabs from "@radix-ui/react-tabs";
import clsx from "clsx";
import React from "react";
import { FaUser } from "react-icons/fa";
import { HiCheckCircle } from "react-icons/hi";

import { trpcApi } from "~features/trpc/api/hooks";

export const Settings = () => {
  const utils = trpcApi.useContext();
  const { data: accounts } = trpcApi.account.me.useQuery();
  const { data: primaryAccount } = trpcApi.account.primary.useQuery();
  const { mutate: changePrimary } = trpcApi.account.changePrimary.useMutation({
    onSuccess() {
      utils.account.primary.invalidate();
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center flex-1 h-16 gap-4 py-4 border-b border-gray-200">
        <h2 className="pl-2 text-xl font-bold">Settings</h2>
        <Button
          onClick={() => {
            window.open(
              `${
                process.env.PLASMO_PUBLIC_WEB_URL
              }/api/auth/signin?${new URLSearchParams({
                callbackUrl: `${process.env.PLASMO_PUBLIC_WEB_URL}/auth/extension`,
              })}`,
            );
          }}
        >
          Add Account
        </Button>
        <Button
          onClick={() => {
            window.open(`${process.env.PLASMO_PUBLIC_WEB_URL}/auth/signout`);
          }}
        >
          Sign Out
        </Button>

        {/* Account Switch */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center justify-center w-8 h-8 rounded bg-primary">
              <FaUser className="w-6 h-6 text-white" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="text-gray-900 bg-white border rounded shadow-xl"
              sideOffset={5}
            >
              {accounts?.map((a, idx) => (
                <DropdownMenu.Item
                  key={a.id}
                  onSelect={() => changePrimary({ id: a.id })}
                >
                  <div
                    className={clsx(
                      "flex items-center justify-between gap-3 p-2 border-gray-900 hover:opacity-80 cursor-pointer",
                      { "border-b": idx !== accounts.length - 1 },
                    )}
                  >
                    <div className="text-sm">{a.email}</div>
                    {a.id === primaryAccount?.id && (
                      <HiCheckCircle className="h-6 text-primary" />
                    )}
                  </div>
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
      {primaryAccount && (
        <div className="p-2">
          <h3 className="text-lg font-bold">Primary Account</h3>
          <p>{primaryAccount.email}</p>
          <p>{primaryAccount.provider}</p>
        </div>
      )}
      <SettingsTabs />
    </div>
  );
};

const SettingsTabs = () => (
  <Tabs.Root
    className="flex flex-col w-full h-full shadow-md"
    defaultValue="tab1"
  >
    <Tabs.List
      className="flex flex-shrink-0 border-b border-mauve-6"
      aria-label="Manage your account"
    >
      <Tabs.Trigger
        className="bg-white h-[45] flex-1 flex items-center justify-center text-xl leading-2 text-mauve-11 select-none hover:text-violet-11 active:text-violet-11 active:shadow-inner active:shadow-violet-11 focus:relative focus:shadow-sm focus:shadow-black"
        value="tab1"
      >
        Account
      </Tabs.Trigger>
      <Tabs.Trigger
        className="bg-white h-[45] flex-1 flex items-center justify-center text-xl leading-2 text-mauve-11 select-none hover:text-violet-11 active:text-violet-11 active:shadow-inner active:shadow-violet-11 focus:relative focus:shadow-sm focus:shadow-black"
        value="tab2"
      >
        Other Settings
      </Tabs.Trigger>
    </Tabs.List>
    <Tabs.Content
      className="p-5 bg-white outline-none flex-grow-1 focus:shadow-sm focus:shadow-black"
      value="tab1"
    >
      <p className="mt-0 mb-[20] text-mauve-11 text-sm">
        Make changes to your account here. Click save when you&saposre done.
      </p>
      <fieldset className="flex flex-col justify-start w-full mb-4">
        <label
          className="mb-3 text-sm text-violet-12 display-block"
          htmlFor="name"
        >
          Name
        </label>
        <input
          className="flex-1 flex-auto pb-2 text-sm shadow-sm border-1 text-violet-11 shadow-violet-7 focus:shadow-sm focus:shadow-violet-8"
          id="name"
          defaultValue="Pedro Duarte"
        />
      </fieldset>
      <fieldset className="flex flex-col justify-start w-full mb-4">
        <label
          className="mb-3 text-sm text-violet-12 display-block"
          htmlFor="username"
        >
          Username
        </label>
        <input
          className="flex-1 flex-auto border-"
          id="username"
          defaultValue="@peduarte"
        />
      </fieldset>
    </Tabs.Content>
    <Tabs.Content className="TabsContent" value="tab2">
      <p className="Text">
        This is just a placeholder for other settings pages{" "}
      </p>
    </Tabs.Content>
  </Tabs.Root>
);
