import clsx from "clsx";
import { type ReactNode, forwardRef } from "react";
import React from "react";
/** A button Element with different variants.
 * Implemented as a forwardRef to allow for radix' ref forwarding in components.
 * @usage given a radix component, e.g.
 * ```tsx
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content sideOffset={5} align="center" side="bottom">
            <div/>
          <Tooltip.Content>
        <Tooltip.Portal>
      <Tooltip.Root>
    <Tooltip.Provider>
  * ```
  * we can use the radix' trigger's `asChild` prop to render the trigger as a child of the radix component:
  * ```tsx
   <Tooltip>
    <Button>Hover me</Button>
   </Tooltip>
  * ```
  * *NB:* This only works if we forward the ref of the radix component to the button along with its props.
 */
// eslint-disable-next-line react/display-name
export const Button = forwardRef<
  HTMLButtonElement,
  {
    onClick?: () => void;
    children: ReactNode;
    variant?: "primary" | "secondary" | "glass" | "error" | "outline";
  } & React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ onClick, variant = "primary", children, className, ...props }, ref) => {
  console.log("PROPSOPR", props);
  return (
    <button
      ref={ref}
      type="button"
      className={clsx(
        "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium leading-4  shadow-sm focus:outline-none",
        {
          "bg-primary text-white hover:bg-primary/80": variant === "primary",
          "border border-primary bg-white text-primary hover:border-mauve-8 hover:border-primary":
            variant === "outline",
          "bg-white text-primary hover:bg-primary/20": variant === "secondary",
          "text-mauve bg-white hover:border-mauve-6 hover:bg-mauve-3":
            variant === "glass",
          "bg-red-9 text-white hover:bg-red-10": variant === "error",
        },
        className,
      )}
      {...props}
      onClick={onClick}
    >
      {children}
    </button>
  );
});
