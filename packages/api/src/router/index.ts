import { t } from "../trpc";

import { postRouter } from "./post";
import { accountRouter } from "./account";
import { userRouter } from "./user";

export const appRouter = t.router({
  post: postRouter,
  account: accountRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
