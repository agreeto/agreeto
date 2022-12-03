import type { Membership } from "@agreeto/api/types";
import { AgreeToLogo, Button } from "@agreeto/ui";
import { HiCheckCircle } from "react-icons/hi";

import { trpc } from "../../../features/trpc/hooks";

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
    trpc.stripe.checkout.create.useMutation({
      onSuccess({ checkoutUrl }) {
        window.location.href = checkoutUrl;
      },
    });

  return (
    <div className="w-full space-y-2 overflow-auto">
      {/* Image */}
      <AgreeToLogo className="h-20 w-20" />

      {/* Title */}
      <h3 className="text-xl font-semibold capitalize">
        {`${plan.toLocaleLowerCase()} Plan`}
      </h3>

      {/* Description */}
      <p className="break-words text-sm text-gray-600">
        Get access to all advanced features
      </p>

      {/* Price */}
      <div className="flex items-end gap-1">
        <b className="text-3xl font-bold">${price}</b>
        <p className="w-min break-words text-xs text-gray-400">{period}</p>
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
