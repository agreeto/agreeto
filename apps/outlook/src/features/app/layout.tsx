import React from "react";
import { signIn } from "../auth/sign-in";
import { signOut } from "../auth/sign-out";

const Navbar = () => {
  return (
    <div className="bg-eindigo-300 flex w-screen justify-center gap-4 p-2">
      <button
        type="button"
        className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        onClick={signIn}
      >
        Add Account
      </button>
      <button
        type="button"
        className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        onClick={signOut}
      >
        Sign Out
      </button>
    </div>
  );
};

export const Layout: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="w-full divide-y">
      <div className="flex h-full flex-col">
        <Navbar />
        {/* - 👇 inject the `children` here 👇 */}
        <div className="h-full w-full flex-grow">{children}</div>
      </div>
    </div>
  );
};
