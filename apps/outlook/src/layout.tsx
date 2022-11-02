import React from "react";
import { signIn } from "./features/auth/sign-in";
import { signOut } from "./features/auth/sign-out";

const Navbar = () => {
  return (
    <div className="w-screen bg-eindigo-300 flex p-2 gap-4">
      <button
        type="button"
        className="inline-flex items-center px-3 py-2 text-sm font-medium leading-4 text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        onClick={signIn}
      >
        Add Account
      </button>
      <button
        type="button"
        className="inline-flex items-center px-3 py-2 text-sm font-medium leading-4 text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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
        <div className="flex-grow w-full h-full">{children}</div>
      </div>
    </div>
  );
};
