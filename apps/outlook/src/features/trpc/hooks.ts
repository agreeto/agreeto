import type { AppRouter } from "@agreeto/api";
import { createTRPCReact } from "@trpc/react-query";

// note (richard): wrapping env var in getter to have api consistency w/ nextjs app (which has additional SSR logic in there)
export const getBaseUrl = () => import.meta.env.VITE_API_URL;

/** React Hooks for interacting with the trpc api from @agreeto/api */
export const trpc = createTRPCReact<AppRouter>();
