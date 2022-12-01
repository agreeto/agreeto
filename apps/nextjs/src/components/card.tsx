import { AgreeToLogo } from "@agreeto/ui";
import React from "react";

export const Card: React.FC<{
  children: React.ReactNode;
  title?: string;
  isLoading?: boolean;
  disclaimer?: React.ReactNode;
}> = ({ children, title = "Welcome to AgreeTo", disclaimer }) => {
  return (
    <div className="max-w-md px-16 py-12 space-y-4 text-center text-gray-600 shadow-2xl rounded-xl">
      <h1 className="text-3xl font-semibold">{title}</h1>
      <div className="relative w-24 h-24 mx-auto">
        <AgreeToLogo className="w-full h-full" />
      </div>

      {/* Content. */}
      {children}

      {/* Disclaimer */}
      {disclaimer && <div className="text-xs">{disclaimer}</div>}
    </div>
  );
};
