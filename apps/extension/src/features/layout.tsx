import type { FC, ReactNode } from "react"
import type React from "react"

import { Navbar } from "~features/navbar"

const Layout: FC<{ children?: ReactNode }> = ({ children }) => {
  return (
    <div className="w-full divide-y">
      {/* WINDOW MANAGER */}
      <div className="flex">
        <button>minimize</button>
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
