import { router } from "../trpc";

import { accountRouter } from "./account";
import { eventRouter } from "./event";
import { eventGroupRouter } from "./event-group";
import { preferenceRouter } from "./preference";
import { sessionRouter } from "./session";
import { userRouter } from "./user";

export const appRouter = router({
  account: accountRouter,
  event: eventRouter,
  eventGroup: eventGroupRouter,
  session: sessionRouter,
  preference: preferenceRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
