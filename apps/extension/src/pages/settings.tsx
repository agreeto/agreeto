import { Button } from "@agreeto/ui";
import * as Tabs from "@radix-ui/react-tabs";
import React from "react";

import { trpcApi } from "~features/trpc/api/hooks";

export const Settings = () => {
  const userQuery = trpcApi.account.me.useQuery();

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
      </div>
      <details className="p-2 overflow-y-scroll">
        <summary className="font-medium text-md">Accounts</summary>
        <pre className="max-w-md overflow-scroll">
          {JSON.stringify(userQuery.data, null, 2)}
        </pre>
      </details>
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
