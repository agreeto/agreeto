import type { AppRouter } from "@agreeto/api"
import {
  CreateTRPCClientOptions,
  createTRPCReact,
  httpBatchLink as httpBatchLinkTrpc
} from "@trpc/react"

// note (richard): wrapping env var in getter to have api consistency w/ nextjs app (which has additional SSR logic in there)
export const getBaseUrl = () => process.env.PLASMO_PUBLIC_WEB_URL

export const trpc = createTRPCReact<AppRouter>()
