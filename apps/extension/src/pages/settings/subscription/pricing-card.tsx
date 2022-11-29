import type { Membership } from "@agreeto/api/types";
import { AgreeToLogo, Button } from "@agreeto/ui";
import { HiCheckCircle } from "react-icons/hi";

import { trpcApi } from "~features/trpc/api/hooks";

const features = [
  { text: "Select & share availability" },
  { text: "Create & confirm Holds" },
  { text: "2 Time Zones" },
  { text: "3 Calendars" },
  { text: "Add colleagues" },
  { text: "Multi-language support" },
];

type PricingCardProps = {
  plan: Exclude<Membership, "FREE" | "TRIAL">;
  period: "monthly" | "annually";
  onBuyClick?: () => void;
};

export const PricingCard = ({ plan, period }: PricingCardProps) => {
  const price = period === "monthly" ? 6 : 48;

  const { mutate: createCheckoutSession } =
    trpcApi.stripe.checkout.create.useMutation({
      onSuccess({ checkoutUrl }) {
        chrome.tabs.create({ url: checkoutUrl });
      },
    });

  return (
    <div className="w-full overflow-auto space-y-2">
      {/* Image */}
      <AgreeToLogo className="h-20 w-20" />

      {/* Title */}
      <h3 className="text-xl font-semibold capitalize">
        {`${plan.toLocaleLowerCase()} Plan`}
      </h3>

      {/* Description */}
      <p className="text-sm break-words text-gray-600">
        Get access to all advanced features
      </p>

      {/* Price */}
      <div className="flex gap-1 items-end">
        <b className="font-bold text-3xl">${price}</b>
        <p className="text-xs text-gray-400 break-words w-min">{period}</p>
      </div>

      {/* Button */}
      <div className="">
        <Button
          className="w-full"
          onClick={() => createCheckoutSession({ plan, period })}
        >
          Subscribe
        </Button>
      </div>

      {/* Features */}
      <div className=" space-y-1">
        {features.map((feat) => (
          <div key={feat.text} className="flex items-center gap-2">
            <div>
              <HiCheckCircle className="h-3 w-3 text-green-600" />
            </div>
            <div className="text-sm text-gray-600">{feat.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
