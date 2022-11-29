import type { AppRouter } from "@agreeto/api";
import { createTRPCReact } from "@trpc/react-query";

// note (richard): wrapping env var in getter to have api consistency w/ nextjs app (which has additional SSR logic in there)
export const getBaseUrl = () => process.env.PLASMO_PUBLIC_WEB_URL;

/** React Hooks for interacting with the trpc api from @agreeto/api */
export const trpcApi = createTRPCReact<AppRouter>();
