import { transformer } from "@agreeto/api/transformer"
import { initTRPC } from "@trpc/server"

const t = initTRPC.context().create({
  transformer,
  errorFormatter({ shape }) {
    return shape
  }
})

export const accessTokenRouter = t.router({
  value: t.procedure.query(async () => {
    const token = await chrome.storage.sync.get("accessToken")
    if (!token || typeof token.accessToken !== "string")
      throw Error("NO token found")
    return token.accessToken
  })
})

export const storageRouter = t.router({
  accessToken: accessTokenRouter
})

// export type definition of API
export type StorageRouter = typeof storageRouter
