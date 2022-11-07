import { router } from "../trpc";

import { accountRouter } from "./account";
import { eventRouter } from "./event/event.router";
import { sessionRouter } from "./session";
import { userRouter } from "./user";

export const appRouter = router({
  account: accountRouter,
  event: eventRouter,
  session: sessionRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
