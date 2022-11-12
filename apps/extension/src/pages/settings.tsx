import { Button } from "@agreeto/ui";

import { trpcApi } from "~features/trpc/api/hooks";

export const Settings = () => {
  const userQuery = trpcApi.account.me.useQuery();

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 border-b border-gray-200 h-16 flex-1 py-4">
        <h2 className="text-xl font-bold pl-2">Settings</h2>
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
        <summary className="text-md font-medium">Accounts</summary>
        <pre className="overflow-scroll max-w-md">
          {JSON.stringify(userQuery.data, null, 2)}
        </pre>
      </details>
    </div>
  );
};
