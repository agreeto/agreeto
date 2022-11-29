import { Membership } from "@agreeto/api/types";
import * as Tabs from "@radix-ui/react-tabs";

import { trpcApi } from "~features/trpc/api/hooks";

import { PricingCard } from "./pricing-card";
import { SubscriptionCard } from "./subscription-card";

export const Subscription = () => {
  const { data: subscription } = trpcApi.user.subscription.useQuery();

  return (
    <div className="p-4 w-full max-w-md mx-auto">
      {subscription && subscription.membership !== "TRIAL" ? (
        <SubscriptionCard subscription={subscription} />
      ) : (
        <Tabs.Root defaultValue="monthly" className="space-y-2">
          <Tabs.List className="text-gray-600 text-sm w-full">
            <Tabs.Trigger
              className="px-3 w-1/2 py-1 border border-r-transparent rounded-l-md border-gray-500 radix-state-active:text-primary radix-state-active:border-primary"
              value="monthly"
            >
              Monthly
            </Tabs.Trigger>
            <Tabs.Trigger
              className="px-3 w-1/2 py-1 border rounded-r-md border-l-transparent border-gray-500 radix-state-active:text-primary radix-state-active:border-primary"
              value="annually"
            >
              Annual
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="monthly">
            <PricingCard period="monthly" plan={Membership.PRO} />
          </Tabs.Content>
          <Tabs.Content value="annually">
            <PricingCard period="annually" plan={Membership.PRO} />
          </Tabs.Content>
        </Tabs.Root>
      )}
    </div>
  );
};
