import { transformer } from "@agreeto/api/transformer"
import { TRPCError, initTRPC } from "@trpc/server"

const t = initTRPC.context().create({
  isServer: false,
  allowOutsideOfServer: true,
  transformer,
  errorFormatter({ shape }) {
    return shape
  }
})

export const chromeRouter = t.router({
  getAccessToken: t.procedure.query(async () => {
    const token = await chrome.storage.sync.get("accessToken")

    if (!token || typeof token.accessToken !== "string") {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "No access token found in your browser's storage"
      })
    }

    return token.accessToken
  })
})

// export type definition of API
export type ChromeRouter = typeof chromeRouter
