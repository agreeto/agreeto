import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "./context";
import superjson from "superjson";
import { Membership } from "@agreeto/db";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

// Middleware to check if the user is logged in
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
    });
  }

  // ctx.user is now properly defined
  ctx.user;
  //   ^?

  return next({
    ctx: {
      user: ctx.user,
    },
  });
});

export const privateProcedure = t.procedure.use(isAuthed);

// Middleware that checks if the user has a Pro subscription
export const proProcedure = privateProcedure.use(async ({ ctx, next }) => {
  const user = await ctx.prisma.user.findUnique({
    where: { id: ctx.user.id },
  });

  // This is enough for now, if creating new subscriptions
  // we might need to refine here
  const isPro = user?.membership !== Membership.FREE;

  if (!isPro) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You need an AgreeTo Pro subscription to do this",
    });
  }

  return next();
});
