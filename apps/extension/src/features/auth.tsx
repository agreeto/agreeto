import { Outlet } from "@tanstack/react-location"
import { z } from "zod"

import { useStorage } from "@plasmohq/storage/hook"

import { storage } from "./storage"

// SCHEMAS
export const Session = z.object({
  expires: z.string(),
  user: z.object({
    id: z.string().optional().nullable(),
    name: z.string().optional().nullable(),
    email: z.string().email().optional().nullable(),
    image: z.string().url().optional().nullable()
  })
})
export const AccessToken = z.string()

// UTILS
export const signOut = async () => {
  // reset accessToken & session
  await storage.set("accessToken", "") // how can I set this to undefined?
  await storage.set("session", {})

  // TODO: broadcast to all tabs?
  // authChannel.postMessage({
  //   action: "logout",
  //   accessToken: accessToken.data
  // })

  // finally, log the browser session out as well
  window.open(`http://localhost:3000/auth/signout`)
}

export const SignIn = () => {
  // Provide authentication to router
  const [accessTokenValue] = useStorage({
    key: "accessToken",
    isSecret: true
  })
  const authentication = AccessToken.safeParse(accessTokenValue)

  if (authentication.success) {
    return <Outlet />
  }
  return (
    <>
      Not signed in <br />
      <button
        className="text-white bg-blue-500 border border-blue-500 hover:ring hover:ring-yellow-500"
        onClick={() => {
          window.open(
            `http://localhost:3000/api/auth/signin?${new URLSearchParams({
              callbackUrl: `${process.env.PLASMO_PUBLIC_WEB_URL}/auth/extension`
            })}`
          )
        }}>
        Sign in
      </button>
    </>
  )
}
export const SignOut = () => {
  return (
    <>
      Not signed in <br />
      <button
        className="text-white bg-blue-500 border border-blue-500 hover:ring hover:ring-yellow-500"
        onClick={() => {
          window.open(
            `http://localhost:3000/api/auth/signin?${new URLSearchParams({
              callbackUrl: `${process.env.PLASMO_PUBLIC_WEB_URL}/auth/extension`
            })}`
          )
        }}>
        Sign in
      </button>
    </>
  )
}
