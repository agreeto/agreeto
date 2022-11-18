import { Button } from "@agreeto/ui";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import clsx from "clsx";
import { FaUser } from "react-icons/fa";
import { HiCheckCircle } from "react-icons/hi";

import { trpcApi } from "~features/trpc/api/hooks";
import { client } from "~features/trpc/chrome/client";

export const Settings = () => {
  const utils = trpcApi.useContext();
  const { data: accounts } = trpcApi.account.me.useQuery();
  const { data: primaryAccount } = trpcApi.account.primary.useQuery();
  const { mutate: changePrimary } = trpcApi.account.changePrimary.useMutation({
    onSuccess() {
      utils.account.primary.invalidate();
    },
  });
  const { mutate: upgradeAccount } = trpcApi.stripe.checkout.create.useMutation(
    {
      async onSuccess({ checkoutUrl }) {
        // Redirect to Stripe checkout
        client.openTab.mutate(checkoutUrl);
      },
    },
  );

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
        <Button onClick={() => upgradeAccount()}>Upgrade Account</Button>
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
            <button className="bg-primary h-8 w-8 rounded flex items-center justify-center">
              <FaUser className="text-white h-6 w-6" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="rounded bg-white text-gray-900 border shadow-xl"
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
                      <HiCheckCircle className="text-primary h-6" />
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
    </div>
  );
};
