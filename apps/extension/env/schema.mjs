// // @ts-check
// import { z } from "zod"

// /**
//  * Specify your client-side environment variables schema here.
//  * This way you can ensure the app isn't built with invalid env vars.
//  * To expose them to the client, prefix them with `PLASMO_PUBLIC_`.
//  */
// export const clientSchema = z.object({
//   PLASMO_PUBLIC_WEB_URL: z.string()
// })

// /**
//  * You can't destruct `process.env` as a regular object, so you have to do
//  * it manually here. This is because Plasmo evaluates this at build time,
//  * and only used environment variables are included in the build.
//  * @type {{ [k in keyof z.infer<typeof clientSchema>]: z.infer<typeof clientSchema>[k] | undefined }}
//  */
// export const clientEnv = {
//   PLASMO_PUBLIC_WEB_URL: process.env.PLASMO_PUBLIC_WEB_URL
// }
