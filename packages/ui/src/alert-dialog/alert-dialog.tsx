import React, { type ReactNode } from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { Button } from "../button";
import { BsExclamationCircle } from "react-icons/bs";
import { TiWarningOutline } from "react-icons/ti";
import { BiInfoCircle } from "react-icons/bi";
import { HiCheckCircle } from "react-icons/hi";
import clsx from "clsx";

const Root = ({ children }: { children: ReactNode }) => {
  return <AlertDialog.Root>{children}</AlertDialog.Root>;
};

const Trigger = ({
  children,
  ...props
}: { children: ReactNode } & Parameters<typeof Button>[0]) => (
  <AlertDialog.Trigger asChild>
    <Button {...props}>{children}</Button>
  </AlertDialog.Trigger>
);

const Body = ({
  children,
  variant,
}: {
  children: ReactNode;
  variant: "error" | "warning" | "info" | "success";
}) => (
  <AlertDialog.Portal>
    <AlertDialog.Overlay className="fixed inset-0 bg-gray-5 opacity-80 transition-opacity" />
    <AlertDialog.Content className="l-1/2 fixed top-1/2 left-1/2 w-3/5 -translate-x-1/2 -translate-y-1/2 bg-white shadow-sm shadow-transparent">
      <div
        className={clsx(
          "flex w-full flex-col gap-2 border-t-4 p-3",
          variant === "error" && "border-red-600",
          variant === "warning" && "border-yellow-600",
          variant === "info" && "border-blue-600",
          variant === "success" && "border-green-600",
        )}
      >
        {children}
        {/* children have the following anatomy: */}
        {/* Dialog Header */}
        {/* Dialog Description */}
        {/* Dialog Footer */}
      </div>
    </AlertDialog.Content>
  </AlertDialog.Portal>
);
// ==============================
// Dialog's Description
// ==============================
const Description = ({ children }: { children: ReactNode }) => (
  <AlertDialog.Description className="mb-2 text-sm font-light text-gray-700">
    {children}
  </AlertDialog.Description>
);

// ==============================
// Dialog's Header Bundle
// ==============================
const Header = ({ children }: { children: ReactNode }) => (
  // REVIEW (richard): removed ml-12 and m-2 because it's not needed?
  <div className="mb-1 flex items-center gap-2 font-bold">{children}</div>
);
const Title = ({ children }: { children: ReactNode }) => (
  <AlertDialog.Title className="text-base font-medium text-gray-900">
    {children}
  </AlertDialog.Title>
);
const Icon = ({
  variant,
}: {
  variant: "error" | "warning" | "info" | "success";
}) => (
  <div
    className={clsx(
      "flex h-8 w-8 items-center justify-center rounded-full p-[.33em]",
      variant === "error" && "bg-red-100",
      variant === "warning" && "bg-yellow-100",
      variant === "info" && "bg-blue-100",
      variant === "success" && "bg-green-100",
    )}
  >
    {variant === "error" ? (
      <BsExclamationCircle className="h-6 w-6 rounded-full bg-white text-red-600" />
    ) : variant === "warning" ? (
      <TiWarningOutline className="h-6 w-6 rounded-full bg-white text-yellow-600" />
    ) : variant === "info" ? (
      <BiInfoCircle className="h-6 w-6 rounded-full bg-white text-blue-600" />
    ) : variant === "success" ? (
      <HiCheckCircle className="h-6 w-6 rounded-full bg-white text-green-600" />
    ) : null}
  </div>
);

// ==============================
// Dialog's Footer Bundle
// ==============================
const Footer = ({ children }: { children: ReactNode }) => (
  <div className="flex justify-end gap-6 bg-mauve-2 p-3">{children}</div>
);
const Action = ({
  children,
  ...props
}: { children: ReactNode } & Parameters<typeof Button>[0]) => (
  <AlertDialog.Action asChild>
    <Button {...props}>{children}</Button>
  </AlertDialog.Action>
);
const Cancel = ({
  children,
  ...props
}: { children: ReactNode } & Parameters<typeof Button>[0]) => (
  <AlertDialog.Cancel asChild>
    <Button {...props}>{children}</Button>
  </AlertDialog.Cancel>
);

/**
 * @example
 * <Dialog>
 *   <Dialog.Trigger variant="primary">
 *     Open Dialog
 *   </Dialog.Trigger>
 *   <Dialog.Body variant="info">
 *     <Dialog.Header>
 *       <Dialog.Icon variant="info" />
 *       <Dialog.Title>
 *         Dialog Title
 *       </Dialog.Title>
 *     </Dialog.Header>
 *     <Dialog.Description>
 *       Are you sure you'd like to delete this item?
 *     </Dialog.Description>
 *     <Dialog.Footer>
 *       <Dialog.Cancel variant="glass">
 *         Cancel
 *       </Dialog.Cancel>
 *       <Dialog.Action variant="primary">
 *         Yes, Delete
 *       </Dialog.Action>
 *     </Dialog.Footer>
 *   </Dialog.Body>
 * </Dialog>
 */
export const Dialog = Object.assign(Root, {
  Trigger,
  Title,
  Header,
  Icon,
  Body,
  Description,
  Footer,
  Action,
  Cancel,
});
