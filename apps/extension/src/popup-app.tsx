import type { FC, ReactNode } from "react"
import type React from "react"

import { useStorage } from "@plasmohq/storage/hook"

import { SignIn } from "~features/auth"
import { Calendar } from "~features/calendar"
import { Navbar } from "~features/navbar"
import { ChromeStorage } from "~storage-schema"

export const App = () => {
  const [accessTokenValue] = useStorage({
    key: "accessToken",
    isSecret: true
  })
  const accessToken = ChromeStorage.accessToken.parse(accessTokenValue)
  if (!accessToken) {
    return <SignIn />
  }

  return (
    <Layout>
      <Calendar />
    </Layout>
  )
}

const Layout: FC<{ children?: ReactNode }> = ({ children }) => {
  return (
    <div className="w-full divide-y">
      {/* window manager */}
      <div className="flex">
        <button>minimize</button>
      </div>
      {/* main app */}
      <div className="flex h-full">
        {/* - navbar */}
        <Navbar />
        {/* - content */}
        <div className="flex-grow w-full h-full">{children}</div>
      </div>
    </div>
  )
}

export default App
