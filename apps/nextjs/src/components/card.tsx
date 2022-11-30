import { AgreeToLogo } from "@agreeto/ui";
import React from "react";

export const Card: React.FC<{
  children: React.ReactNode;
  title?: string;
  isLoading?: boolean;
  disclaimer?: React.ReactNode;
}> = ({ children, title = "Welcome to AgreeTo", disclaimer }) => {
  return (
    <div className="max-w-md space-y-4 rounded-xl px-16 py-12 text-center text-gray-600 shadow-2xl">
      <h1 className="text-3xl font-semibold">{title}</h1>
      <div className="relative mx-auto h-24 w-24">
        <AgreeToLogo className="h-full w-full" />
      </div>

      {/* Content */}
      {children}

      {/* Disclaimer */}
      {disclaimer && <div className="text-xs">{disclaimer}</div>}
    </div>
  );
};
