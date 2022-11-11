import type { ReactNode } from "react";
import React from "react";

export const Button: React.FC<{
  onClick?: () => void;
  children: ReactNode;
}> = (props) => {
  return (
    <button
      type="button"
      className="inline-flex items-center px-3 py-2 text-sm font-medium leading-4 text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
};
