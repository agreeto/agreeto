import { Membership } from "@agreeto/api/types";
import { Button } from "@agreeto/ui";
import type { FC } from "react";

import { trpcApi } from "~features/trpc/api/hooks";

type SubscriptionCardProps = {
  membership: Membership;
  period: "monthly" | "annual";
};

export const SubscriptionCard: FC<SubscriptionCardProps> = ({
  membership,
  period,
}) => {
  const title = membership === Membership.PRO ? "Pro Plan" : "Premium Plan";
  const price = period === "monthly" ? 6 : 48;

  const { mutate: createBillingPortalSession } =
    trpcApi.stripe.subscription.createBillingPortalSession.useMutation({
      onSuccess({ url }) {
        chrome.tabs.create({ url });
      },
    });

  return (
    <div className="border rounded-lg border-gray-300">
      <div className="py-2 px-5 border-b border-gray-300 text-lg">
        Your Subscription
      </div>

      <div className="p-5">
        <div className="flex justify-between">
          <div>
            <div className="flex space-x-2 items-center">
              <div className="bg-gray-900 text-white py-1 px-3 rounded text-sm">
                {title}
              </div>
              <div className="text-sm capitalize">{period}</div>
            </div>
          </div>
          <div>
            <span className="text-xl font-semibold">{`$${price}`}</span>
          </div>
        </div>

        <div className="flex justify-between pt-12 items-end">
          <Button
            className="button w-60 block"
            onClick={() => createBillingPortalSession()}
          >
            Manage Subscription
          </Button>
        </div>
      </div>
    </div>
  );
};
