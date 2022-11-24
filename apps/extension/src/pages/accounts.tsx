import { Membership } from "@agreeto/api/types";
import { Button, PaywallTooltip } from "@agreeto/ui";

import AccountCard from "~features/accounts/account-card";
import { trpcApi } from "~features/trpc/api/hooks";

/**
 * A container for a list of account cards with a CTA button on the top right.
 *
 * The CTA button is behind a paywall and only enabled for premium users.
 *
 * @returns JSX.Element
 */
export const Accounts = () => {
  const { data: user } = trpcApi.user.myAccounts.useQuery();

  return (
    <div className="flex flex-col w-full h-full p-8 space-y-8">
      {/* header & CTA above the list */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Accounts</h3>
        {/* conditional cta button */}
        {user?.membership === Membership.FREE ? ( // if on free, show a tooltip to upgrade plan
          <PaywallTooltip>
            <Button
              className="w-48 cursor-not-allowed"
              variant="primary"
              disabled
            >
              Add New
            </Button>
          </PaywallTooltip>
        ) : (
          <Button // if on paid/trial, show a button to add an account
            className="w-48"
            variant="primary"
            onClick={openNextAuthLoginPage}
          >
            Add Account
          </Button>
        )}
      </div>
      {/* the list of account cards */}
      <div className="flex flex-col gap-1">
        {user?.accounts?.map((account) => (
          <AccountCard key={account.id} account={account} />
        ))}
      </div>
    </div>
  );
};

/**
 * Opens a new tab on the nextjs web app to the NextAuth login screen.
 * If the user logs in with a new account, we link the accounts.
 */
const openNextAuthLoginPage = () => {
  window.open(
    `${process.env.PLASMO_PUBLIC_WEB_URL}/api/auth/signin?${new URLSearchParams(
      {
        callbackUrl: `${process.env.PLASMO_PUBLIC_WEB_URL}/auth/extension`,
      },
    )}`,
  );
};
