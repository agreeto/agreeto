import { z } from "zod"

import { Storage } from "@plasmohq/storage"

const SessionValidator = z.object({
  expires: z.string(),
  user: z.object({
    id: z.string().optional().nullable(),
    name: z.string().optional().nullable(),
    email: z.string().email().optional().nullable(),
    image: z.string().url().optional().nullable()
  })
})

export const AccessTokenValidator = z.string()

const ChromeStorageSchema = z.object({
  accessToken: AccessTokenValidator,
  session: SessionValidator.optional()
})

export const ChromeStorage = ChromeStorageSchema.shape

export const storage = new Storage({
  // secretKeyList prevents the key being mirrored in localStorage
  secretKeyList: ["accessToken"]
})

export const getStorageToken = async () => {
  const token = await storage.get("accessToken")
  if (ChromeStorage.accessToken.safeParse(token).success) {
    return { token, status: "success" } as const
  }
  return { token: null, status: "error" } as const
}
