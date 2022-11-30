// @ts-check
import { z } from "zod";

/**
 * Specify your server-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 */
export const serverSchema = z.lazy(() =>
  z.object({
    // Node environment, don't have to be set in .env
    NODE_ENV: z.enum(["development", "test", "production"]),

    // Rest should be explicitely defined in your .env
    GOOGLE_ID: z.string(),
    GOOGLE_SECRET: z.string(),
    AZURE_AD_CLIENT_ID: z.string(),
    AZURE_AD_CLIENT_SECRET: z.string(),

    NEXTAUTH_SECRET: z.string(),
    NEXTAUTH_URL: z.preprocess(
      // Let VERCEL_URL take precedence if it's set
      // @see https://next-auth.js.org/configuration/options#nextauth_url
      (str) => process.env.VERCEL_URL ?? str,
      // VERCEL_URL doesn't include the `https://` prefix and is thus not a valid z.url()
      process.env.VERCEL_URL ? z.string() : z.string().url(),
    ),

    // Stripe Payments
    STRIPE_PK: z.string(),
    STRIPE_SK: z.string(),
    STRIPE_WEBHOOK_SECRET: z.string(),

    STRIPE_MONTHLY_PRICE_ID: z.string(),
    STRIPE_ANNUALLY_PRICE_ID: z.string(),
  }),
);

/**
 * Specify your client-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 * To expose them to the client, prefix them with `NEXT_PUBLIC_`.
 */
export const clientSchema = z.object({
  NEXT_PUBLIC_EXTENSION_ID: z.string(),
  NEXT_PUBLIC_OUTLOOK_ADDIN_URL: z.string(),
});

/**
 * You can't destruct `process.env` as a regular object, so you have to do
 * it manually here. This is because Next.js evaluates this at build time,
 * and only used environment variables are included in the build.
 * @type {{ [k in keyof z.infer<typeof clientSchema>]: z.infer<typeof clientSchema>[k] | undefined }}
 */
export const clientEnv = {
  NEXT_PUBLIC_EXTENSION_ID: process.env.NEXT_PUBLIC_EXTENSION_ID,
  NEXT_PUBLIC_OUTLOOK_ADDIN_URL: process.env.NEXT_PUBLIC_OUTLOOK_ADDIN_URL,
  NEXT_PUBLIC_PORT: process.env.NEXT_PUBLIC_PORT,
};
