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
    variant?:
      | "primary"
      | "secondary"
      | "glass"
      | "error"
      | "outline"
      | "warning"
      | "info"
      | "success";
  } & React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ onClick, variant = "primary", children, className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      className={clsx(
        "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium leading-4  shadow-sm focus:outline-none",
        variant === "primary" && "bg-primary text-white hover:bg-primary/80",
        variant === "outline" &&
          "border border-primary bg-white text-primary hover:border-mauve-8 hover:border-primary",
        variant === "secondary" && "bg-white text-primary hover:bg-primary/20",
        variant === "glass" &&
          "text-mauve bg-white hover:border-mauve-6 hover:bg-mauve-3",
        variant === "error" && "bg-red-9 text-white hover:bg-red-10",
        variant === "warning" && "bg-yellow-9 text-white hover:bg-yellow-10",
        variant === "info" && "bg-blue-9 text-white hover:bg-blue-10",
        variant === "success" && "bg-green-9 text-white hover:bg-green-10",
        className,
      )}
      {...props}
      onClick={onClick}
    >
      {children}
    </button>
  );
});
