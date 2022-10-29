import { ReactLocation, Router } from "@tanstack/react-location"
import { useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import { SignIn } from "~features/auth"
import Layout from "~features/layout"
import { getRoutes, reactLocationOptions } from "~features/router"
import { ChromeStorage } from "~storage-schema"
import { trpc } from "~trpc"

const Document = () => {
  // Authentication
  const [accessTokenValue] = useStorage({
    key: "accessToken",
    isSecret: true
  })
  const authentication = ChromeStorage.accessToken.safeParse(accessTokenValue)

  // Configure router
  const [location] = useState(() => new ReactLocation(reactLocationOptions))

  // tRPC context
  const utils = trpc.useContext()

  if (!authentication.success)
    return (
      <Layout>
        <SignIn />
      </Layout>
    )

  // Providers
  return (
    <Router
      location={location}
      // @ts-expect-error - TODO: fix this?
      routes={getRoutes({ utils, accessToken: authentication.data })}
    />
  )
}

export default Document
