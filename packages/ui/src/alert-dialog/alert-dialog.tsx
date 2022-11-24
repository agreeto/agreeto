import type { ReactNode } from "react";
import * as RdxAlertDialog from "@radix-ui/react-alert-dialog";

export const Root = RdxAlertDialog.Root;
export const Trigger = RdxAlertDialog.Trigger;
export const Portal = RdxAlertDialog.Portal;
export const Overlay = RdxAlertDialog.Overlay;
export const Content = RdxAlertDialog.Content;
export const Action = RdxAlertDialog.Action;
export const Cancel = RdxAlertDialog.Cancel;
export const Title = RdxAlertDialog.Title;
export const Description = RdxAlertDialog.Description;

export const Body = ({ children }: { children: ReactNode }) => (
  <RdxAlertDialog.Portal>
    <RdxAlertDialog.Overlay className="fixed inset-0 transition-opacity bg-blackA-9 opacity-80" />
    <RdxAlertDialog.Content className="fixed w-3/5 -translate-x-1/2 -translate-y-1/2 bg-white rounded-md shadow-sm l-1/2 top-1/2 left-1/2 shadow-transparent">
      {children}
    </RdxAlertDialog.Content>
  </RdxAlertDialog.Portal>
);
