import { privateProcedure, router } from "../trpc";
import { z } from "zod";

import { DateFormat, IntroSentenceType, Language } from "@agreeto/db";

export const formattingRouter = router({
  // Get all formatting options for the current user
  byCurrentUser: privateProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    return ctx.prisma.formatting.findMany({
      where: { userId },
    });
  }),

  // Update formatting for the current user
  update: privateProcedure
    .input(
      z.object({
        language: z.nativeEnum(Language),
        dateFormat: z.nativeEnum(DateFormat),
        introSentenceType: z.nativeEnum(IntroSentenceType),
        introSentence: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      return ctx.prisma.formatting.upsert({
        where: {
          userId_language: {
            userId,
            language: input.language,
          },
        },
        update: {
          language: input.language,
          introSentence: input.introSentence,
          introSentenceType: input.introSentenceType,
          dateFormat: input.dateFormat,
        },
        create: {
          userId,
          language: input.language,
          introSentence: input.introSentence,
          introSentenceType: input.introSentenceType,
          dateFormat: input.dateFormat,
        },
      });
    }),
});
