import { type RouterOutputs } from "@agreeto/api";
import { Button } from "@agreeto/ui";
import type { FC } from "react";

import { trpc } from "../../../features/trpc/hooks";

type SubscriptionCardProps = {
  subscription: RouterOutputs["user"]["subscription"];
};

export const SubscriptionCard: FC<SubscriptionCardProps> = ({
  subscription,
}) => {
  const price = subscription.period === "monthly" ? 6 : 48;

  const { mutate: createBillingPortalSession } =
    trpc.stripe.subscription.createBillingPortalSession.useMutation({
      onSuccess({ url }) {
        window.location.href = url;
      },
    });

  const formattedDate = Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(subscription.current_period_end);

  return (
    <div className="w-full rounded-lg border border-gray-300">
      <div className="border-b border-gray-300 py-2 px-5 text-lg">
        Your Subscription
      </div>

      <div className="p-5">
        <div className="flex justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <div className="rounded bg-gray-900 py-1 px-3 text-sm capitalize text-white">
                {subscription.membership.toLowerCase()}
              </div>
              <div className="text-sm capitalize">{subscription.period}</div>
            </div>
          </div>
          <div>
            <span className="text-xl font-semibold">{`$${price}`}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-12">
          <div>
            <span className="text-sm font-semibold text-gray-500">
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
