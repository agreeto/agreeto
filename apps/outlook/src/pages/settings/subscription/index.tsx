import { Membership } from "@agreeto/api/types";
import * as Tabs from "@radix-ui/react-tabs";

import { trpc } from "../../../features/trpc/hooks";

import { PricingCard } from "./pricing-card";
import { SubscriptionCard } from "./subscription-card";

export const Subscription = () => {
  const { data: subscription, isLoading } = trpc.user.subscription.useQuery();

  if (isLoading) return null;

  return (
    <div className="mx-auto w-full max-w-md p-4">
      {subscription && subscription.membership !== "TRIAL" ? (
        <SubscriptionCard subscription={subscription} />
      ) : (
        <Tabs.Root defaultValue="monthly" className="space-y-2">
          <Tabs.List className="w-full text-sm text-gray-600">
            <Tabs.Trigger
              className="w-1/2 rounded-l-md border border-gray-500 border-r-transparent px-3 py-1 radix-state-active:border-primary radix-state-active:text-primary"
              value="monthly"
            >
              Monthly
            </Tabs.Trigger>
            <Tabs.Trigger
              className="w-1/2 rounded-r-md border border-gray-500 border-l-transparent px-3 py-1 radix-state-active:border-primary radix-state-active:text-primary"
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
