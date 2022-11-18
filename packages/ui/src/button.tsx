import clsx from "clsx";
import type { ReactNode } from "react";
import React from "react";

export const Button: React.FC<
  {
    onClick?: () => void;
    children: ReactNode;
    variant?: "primary" | "secondary" | "glass" | "error";
  } & React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ onClick, variant = "primary", children, ...props }) => {
  return (
    <button
      type="button"
      className={clsx(
        "inline-flex items-center justify-center rounded-md border border-transparent px-3 py-2 text-sm font-medium leading-4  shadow-sm focus:outline-none",
        {
          "bg-primary text-white hover:bg-primary/80": variant === "primary",
          "bg-white text-primary hover:bg-primary/20": variant === "secondary",
          "bg-default text-mauve hover:opacity-70": variant === "glass",
          "bg-red-9 text-white hover:opacity-70": variant === "error",
        },
        props.className,
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
