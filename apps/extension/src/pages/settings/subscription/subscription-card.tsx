import { type RouterOutputs } from "@agreeto/api";
import { Button } from "@agreeto/ui";
import type { FC } from "react";

import { trpcApi } from "~features/trpc/api/hooks";

type SubscriptionCardProps = {
  subscription: RouterOutputs["user"]["subscription"];
};

export const SubscriptionCard: FC<SubscriptionCardProps> = ({
  subscription,
}) => {
  const price = subscription.period === "monthly" ? 6 : 48;

  const { mutate: createBillingPortalSession } =
    trpcApi.stripe.subscription.createBillingPortalSession.useMutation({
      onSuccess({ url }) {
        chrome.tabs.create({ url });
      },
    });

  const formattedDate = Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(subscription.current_period_end);

  return (
    <div className="border rounded-lg border-gray-300 w-full">
      <div className="py-2 px-5 border-b border-gray-300 text-lg">
        Your Subscription
      </div>

      <div className="p-5">
        <div className="flex justify-between">
          <div>
            <div className="flex space-x-2 items-center">
              <div className="bg-gray-900 text-white py-1 px-3 rounded text-sm capitalize">
                {subscription.membership.toLowerCase()}
              </div>
              <div className="text-sm capitalize">{subscription.period}</div>
            </div>
          </div>
          <div>
            <span className="text-xl font-semibold">{`$${price}`}</span>
          </div>
        </div>

        <div className="flex justify-between items-center pt-12">
          <div>
            <span className="font-semibold text-gray-500 text-sm">
              Next Payment
            </span>
            <div className="text-sm text-gray-900">{formattedDate}</div>
          </div>
          <Button onClick={() => createBillingPortalSession()}>
            Manage Subscription
          </Button>
        </div>
      </div>
    </div>
  );
};
