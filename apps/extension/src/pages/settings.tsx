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
  <Tabs.Root className="TabsRoot" defaultValue="tab1">
    <Tabs.List className="TabsList" aria-label="Manage your account">
      <Tabs.Trigger className="TabsTrigger" value="tab1">
        Account
      </Tabs.Trigger>
      <Tabs.Trigger className="TabsTrigger" value="tab2">
        Other Settings
      </Tabs.Trigger>
    </Tabs.List>
    <Tabs.Content className="TabsContent" value="tab1">
      <p className="Text">
        Make changes to your account here. Click save when you&saposre done.
      </p>
      <fieldset className="Fieldset">
        <label className="Label" htmlFor="name">
          Name
        </label>
        <input className="Input" id="name" defaultValue="Pedro Duarte" />
      </fieldset>
      <fieldset className="Fieldset">
        <label className="Label" htmlFor="username">
          Username
        </label>
        <input className="Input" id="username" defaultValue="@peduarte" />
      </fieldset>
      <div
        style={{ display: "flex", marginTop: 20, justifyContent: "flex-end" }}
      >
        <button className="Button green">Save changes</button>
      </div>
    </Tabs.Content>
    <Tabs.Content className="TabsContent" value="tab2">
      <p className="Text">
        This is just a placeholder for other settings pages{" "}
      </p>
    </Tabs.Content>
  </Tabs.Root>
);
