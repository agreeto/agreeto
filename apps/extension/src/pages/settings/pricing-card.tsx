// import logoIcon from "data-base64:~assets/icon512.png";
import { Membership } from "@agreeto/api/types";
import type { FC } from "react";
import { HiCheckCircle } from "react-icons/hi";

import { trpcApi } from "~features/trpc/api/hooks";

type Props = {
  plan: Extract<Membership, "PRO" | "PREMIUM">;
  period: "monthly" | "annual";
  onBuyClick?: () => void;
};

interface Feature {
  text: string;
}

export const PricingCard: FC<Props> = ({ plan, period }) => {
  const title = plan === Membership.PRO ? "Pro Plan" : "Premium Plan";
  const price = period === "monthly" ? 6 : 48;

  const features: Feature[] = [
    {
      text: "Select & share availability",
    },
    {
      text: "Create & confirm Holds",
    },
    {
      text: "2 Time Zones",
    },
    {
      text: "3 Calendars",
    },
    {
      text: "Add colleagues",
    },
    {
      text: "Multi-language support",
    },
  ];

  const { mutate: createCheckoutSession } =
    trpcApi.stripe.checkout.create.useMutation({
      onSuccess({ checkoutUrl }) {
        chrome.tabs.create({ url: checkoutUrl });
      },
    });

  const feature = ({ text }: Feature) => (
    <div key={text} className="flex items-center gap-2">
      <div>
        <HiCheckCircle className="h-3 w-3 text-green-600" />
      </div>
      <div className="text-sm text-gray-600">{text}</div>
    </div>
  );

  return (
    <div className="w-60">
      {/* Image */}
      {/* <div>
        <img src={logoIcon} width={100} height={100} />
      </div> */}

      {/* Title */}
      <div className="text-xl font-semibold pt-1">{title}</div>

      {/* Description */}
      <div className="text-sm text-gray-600 pt-3">
        Get access to all advanced features
      </div>

      {/* Price */}
      <div className="flex pt-6 space-x-1 items-center">
        <div className="font-bold text-4xl">${price}</div>
        <div className="text-xs text-gray-400 leading-none">
          <div>per</div>
          <div>{period}</div>
        </div>
      </div>

      {/* Button */}
      <div className="pt-4">
        <button
          className="button w-full"
          onClick={() => createCheckoutSession({ plan, period })}
        >
          Subscribe
        </button>
      </div>

      {/* Features */}
      <div className="pt-4 space-y-1">{features.map(feature)}</div>
    </div>
  );
};
