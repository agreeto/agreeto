import { Membership } from "@agreeto/api/types";
import * as Tabs from "@radix-ui/react-tabs";

import { trpcApi } from "~features/trpc/api/hooks";

import { PricingCard } from "./pricing-card";
import { SubscriptionCard } from "./subscription-card";

export const Subscription = () => {
  const { data: user } = trpcApi.user.me.useQuery();
  const { data: subscription } = trpcApi.user.subscription.useQuery();

  return (
    <div>
      {user && subscription ? (
        <SubscriptionCard
          membership={user.membership}
          period={subscription.period}
        />
      ) : (
        <Tabs.Root defaultValue="monthly">
          <Tabs.List>
            <Tabs.Trigger value="monthly">Monthly</Tabs.Trigger>
            <Tabs.Trigger value="annual">Annual</Tabs.Trigger>
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
