import { type DefaultSession } from "next-auth";
import { type AdapterAccount as $AdapterAccount } from "next-auth/adapters";

/**
 * Module augmentation for `next-auth` types
 * Allows us to add custom properties to the `session` object
 * and keep type safety
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/adapters" {
  // Overriding the AdapterAccount to have less nullable fields,
  // since both Microsoft and Google OAuth providers always return
  interface AdapterAccount extends $AdapterAccount {
    access_token: string;
    refresh_token: string;
    expires_at: number;
    token_type: string;
    scope: string;
  }
}
