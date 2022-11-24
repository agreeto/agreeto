import type { ReactNode } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import type { DropdownMenuContentProps } from "@radix-ui/react-dropdown-menu";
import clsx from "clsx";

// ==============================
// Radix Components
// https://github.com/radix-ui/primitives/blob/main/packages/react/dropdown-menu/src/index.ts
// ==============================
export const Root = DropdownMenu.Root;
export const Trigger = DropdownMenu.Trigger;
export const Portal = DropdownMenu.Portal;
export const Group = DropdownMenu.Group;
export const Label = DropdownMenu.Label;
export const Item = DropdownMenu.Item;
export const CheckboxItem = DropdownMenu.CheckboxItem;
export const RadioGroup = DropdownMenu.RadioGroup;
export const RadioItem = DropdownMenu.RadioItem;
export const ItemIndicator = DropdownMenu.ItemIndicator;
export const Separator = DropdownMenu.Separator;
export const Arrow = DropdownMenu.Arrow;
export const Sub = DropdownMenu.Sub;
export const SubTrigger = DropdownMenu.SubTrigger;
export const SubContent = DropdownMenu.SubContent;

// ==============================
// CUSTOM OVERRIDES
// ==============================
export const Content = ({
  children,
  className,
  ...props
}: { children: ReactNode } & DropdownMenuContentProps) => (
  <DropdownMenu.Content
    className={clsx(
      "absolute right-0 mt-2 w-52 origin-top-right divide-y divide-mauve-6 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none",
      //   note (richard): add variants like this if desired
      //   {
      //     "bg-primary text-white hover:bg-primary/80": variant === "primary",
      //   },
      className,
    )}
    {...props}
  >
    {children}
  </DropdownMenu.Content>
);

// ==============================
// CUSTOM COMPONENTS
// ==============================
