import { Button } from "@agreeto/ui";
import { MinusCircleIcon } from "@heroicons/react/20/solid";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import type { FC, ReactNode } from "react";

import { useStorage } from "@plasmohq/storage/hook";

import { Navbar } from "~app/navbar";
import { AccessTokenValidator } from "~features/trpc/chrome/storage";

export const Layout: FC<{ children?: ReactNode }> = ({ children }) => {
  const [accessTokenValue] = useStorage({
    key: "accessToken",
    isSecret: true,
  });
  const authentication = AccessTokenValidator.safeParse(accessTokenValue);

  if (!process.env.PLASMO_PUBLIC_WEB_URL) {
    // FIXME: Intermediary solution to make sure the public web URL is set
    return (
      <h1 className="text-red-500 font-bold">
        PLASMO_PUBLIC_WEB_URL is not defined
      </h1>
    );
  }

  return (
    <div className="w-full divide-y">
      {/* WINDOW MANAGER */}
      <div className="flex">
        <button
          title="minimize"
          type="button"
          className="inline-flex items-center p-1 text-white bg-indigo-600 border border-transparent rounded-full shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <MinusCircleIcon className="w-5 h-5" aria-hidden="true" />
        </button>
        {authentication.success && (
          <>
            <SeparatorPrimitive.Root
              decorative
              orientation="vertical"
              className="w-px mx-4 bg-indigo-600 h-inherit"
              data-aria-orientation="vertical"
            />
            <Button
              title="Add Account"
              onClick={() => {
                window.open(
                  `${
                    process.env.PLASMO_PUBLIC_WEB_URL
                  }/api/auth/signin?${new URLSearchParams({
                    callbackUrl: `${process.env.PLASMO_PUBLIC_WEB_URL}/auth/extension`,
                  })}`,
                );
              }}
            />
            <SeparatorPrimitive.Root
              decorative
              orientation="vertical"
              className="w-px mx-4 bg-indigo-600 h-inherit"
              data-aria-orientation="vertical"
            />
            <Button
              title="Sign Out"
              onClick={() => {
                window.open(
                  `${process.env.PLASMO_PUBLIC_WEB_URL}/auth/signout`,
                );
              }}
            />
            <h2>Signed in as {authentication.data}</h2>
          </>
        )}
      </div>
      {/* ACTUAL APP */}
      <div className="flex h-full">
        <Navbar />
        {/* - 👇 inject the `children` here 👇 */}
        <div className="flex-grow w-full h-full">{children}</div>
      </div>
    </div>
  );
};
