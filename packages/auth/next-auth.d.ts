import { type DefaultSession, type TokenSet, type User } from "next-auth";

/**
 * Module augmentation for `next-auth` types
 * Allows us to add custom properties to the `session` object
 * and keep type safety
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: TokenSet["access_token"];
    accessTokenExpires: TokenSet["expires_at"];
    refreshToken: TokenSet["refresh_token"];
    user: User;
  }
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
    accessToken: TokenSet["access_token"];
  }
}
