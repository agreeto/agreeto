import * as Tooltip from "@radix-ui/react-tooltip";
import type { ReactNode, FC } from "react";
import { Button } from "./button";

export const PaywallTooltip: FC<{
  onUpgradeClick: () => void;
  children: ReactNode;
}> = ({ onUpgradeClick, children }) => {
  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content sideOffset={5} align="center" side="bottom">
            <div
              className="mt-4 w-60 cursor-auto rounded border border-[#F9FAFA] bg-[#F9FAFA] p-4 text-left"
              style={{ boxShadow: "2px 4px 12px 2px #dbd9d9" }}
            >
              <div className="color-gray-900 text-sm font-semibold">
                Unlock Multiple Calendars
              </div>
              <div className="color-gray-900 my-2 text-xs">
                This feature is part of the Pro Plan
              </div>
              <div className="mt-5 flex w-full items-center justify-center">
                <Button
                  className="py-1"
                  variant="outline"
                  onClick={() => onUpgradeClick()}
                >
                  Upgrade
                </Button>
              </div>
            </div>
            <Tooltip.Arrow className="fill-black" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};
