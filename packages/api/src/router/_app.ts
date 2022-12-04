import { router } from "../trpc";

import { accountRouter } from "./account";
import { eventRouter } from "./event";
import { eventGroupRouter } from "./event-group";
import { preferenceRouter } from "./preference";
import { formattingRouter } from "./formatting";
import { sessionRouter } from "./session";
import { stripeRouter } from "./stripe";
import { userRouter } from "./user";

export const appRouter = router({
  account: accountRouter,
  event: eventRouter,
  eventGroup: eventGroupRouter,
  session: sessionRouter,
  stripe: stripeRouter,
  preference: preferenceRouter,
  formatting: formattingRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
