import type { ReactNode } from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";

// ==============================
// Radix Components
// https://github.com/radix-ui/primitives/blob/main/packages/react/alert-dialog/src/index.ts
// ==============================
export const Root = AlertDialog.Root;
export const Trigger = AlertDialog.Trigger;
export const Portal = AlertDialog.Portal;
export const Overlay = AlertDialog.Overlay;
export const Content = AlertDialog.Content;
export const Action = AlertDialog.Action;
export const Cancel = AlertDialog.Cancel;
export const Title = AlertDialog.Title;
export const Description = AlertDialog.Description;

// ==============================
// CUSTOM OVERRIDES
// ==============================

// ==============================
// CUSTOM COMPONENTS
// ==============================

export const Body = ({ children }: { children: ReactNode }) => (
  <AlertDialog.Portal>
    <AlertDialog.Overlay className="fixed inset-0 transition-opacity bg-blackA-9 opacity-80" />
    <AlertDialog.Content className="fixed w-3/5 -translate-x-1/2 -translate-y-1/2 bg-white rounded-md shadow-sm l-1/2 top-1/2 left-1/2 shadow-transparent">
      {children}
    </AlertDialog.Content>
  </AlertDialog.Portal>
);
