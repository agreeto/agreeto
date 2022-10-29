import { MinusCircleIcon } from "@heroicons/react/20/solid"
import * as SeparatorPrimitive from "@radix-ui/react-separator"
import type { FC, ReactNode } from "react"
import type React from "react"

import { Navbar } from "~features/navbar"

const Layout: FC<{ children?: ReactNode }> = ({ children }) => {
  return (
    <div className="w-full divide-y">
      {/* WINDOW MANAGER */}
      <div className="flex">
        <button
          title="minimize"
          type="button"
          className="inline-flex items-center p-1 text-white bg-indigo-600 border border-transparent rounded-full shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
          <MinusCircleIcon className="w-5 h-5" aria-hidden="true" />
        </button>
        <SeparatorPrimitive.Root
          decorative
          orientation="vertical"
          className="w-px mx-4 bg-indigo-600 h-inherit"
          data-aria-orientation="vertical"
        />
        <button
          type="button"
          className="inline-flex items-center px-3 py-2 text-sm font-medium leading-4 text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          onClick={() => {
            window.open(
              `http://localhost:3000/api/auth/signin?${new URLSearchParams({
                // FIXME: include env var dep in turbo.json
                // eslint-disable-next-line
                callbackUrl: `${process.env
                  .PLASMO_PUBLIC_WEB_URL!}/auth/extension`
              })}`
            )
          }}>
          Add Account
        </button>
        <SeparatorPrimitive.Root
          decorative
          orientation="vertical"
          className="w-px mx-4 bg-indigo-600 h-inherit"
          data-aria-orientation="vertical"
        />
        <button
          type="button"
          className="inline-flex items-center px-3 py-2 text-sm font-medium leading-4 text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          onClick={() => {
            // FIXME: include env var dep in turbo.json
            // eslint-disable-next-line
            window.open(`${process.env.PLASMO_PUBLIC_WEB_URL!}/auth/signout`)
          }}>
          Sign Out
        </button>
      </div>
      {/* ACTUAL APP */}
      <div className="flex h-full">
        <Navbar />
        {/* - 👇 inject the `children` here 👇 */}
        <div className="flex-grow w-full h-full">{children}</div>
      </div>
    </div>
  )
}

export default Layout
