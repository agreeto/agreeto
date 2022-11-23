import { Membership } from "@agreeto/api/types";
import * as Tabs from "@radix-ui/react-tabs";

import { trpcApi } from "~features/trpc/api/hooks";

import { PricingCard } from "./pricing-card";
import { SubscriptionCard } from "./subscription-card";

export const Subscription = () => {
  const { data: subscription } = trpcApi.user.subscription.useQuery();

  return (
    <div className="p-4 w-60 mx-auto">
      {false && subscription ? (
        <SubscriptionCard
          membership={subscription.membership}
          period={subscription.period}
        />
      ) : (
        <Tabs.Root defaultValue="monthly" className="space-y-2">
          <Tabs.List className="text-gray-600 text-sm w-full">
            <Tabs.Trigger
              className="px-3 w-1/2 py-1 border-y border-l radix-state-active:border-r rounded-l-md border-gray-500 radix-state-active:text-primary radix-state-active:border-primary"
              value="monthly"
            >
              Monthly
            </Tabs.Trigger>
            <Tabs.Trigger
              className="px-3 w-1/2 py-1 border-y border-r radix-state-active:border-l rounded-r-md border-gray-500 radix-state-active:text-primary radix-state-active:border-primary"
              value="annual"
            >
              Annual
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="monthly">
            <PricingCard period="monthly" plan={Membership.PRO} />
          </Tabs.Content>
          <Tabs.Content value="annual">
            <PricingCard period="annual" plan={Membership.PRO} />
          </Tabs.Content>
        </Tabs.Root>
      )}
    </div>
  );
};
