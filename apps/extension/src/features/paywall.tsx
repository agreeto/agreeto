import { PaywallTooltip as $PaywallTooltip } from "@agreeto/ui";
import { type ReactNode } from "react";

import { router } from "~features/router/config";

/** Curry the Tooltip to add the extensions redirect method */
export const PaywallTooltip = ({ children }: { children: ReactNode }) => {
  return (
    <$PaywallTooltip
      onUpgradeClick={() => router.navigate({ to: "/settings/subscription" })}
    >
      {children}
    </$PaywallTooltip>
  );
};
