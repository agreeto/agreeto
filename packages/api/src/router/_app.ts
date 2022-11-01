import { router } from "../trpc";

import { accountRouter } from "./account";
import { postRouter } from "./post";
import { sessionRouter } from "./session";
import { userRouter } from "./user";

export const appRouter = router({
  account: accountRouter,
  post: postRouter,
  session: sessionRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
