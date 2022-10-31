import { prisma } from "@agreeto/db";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import { refreshAccessToken } from "./refresh-access-token";
import { getGoogleProvider } from "./providers/google";
import { getAzureAdProvider } from "./providers/azure";

export type GetAuthOptionsParams = {
  secret: string;
  googleClientId: string;
  googleClientSecret: string;
  azureAdClientId: string;
  azureAdClientSecret: string;
  azureAdTenantId: string;
};
type GetAuthOptions = (params: GetAuthOptionsParams) => NextAuthOptions;

export const getAuthOptions: GetAuthOptions = (opts) => ({
  /** Use Prisma adapter to persist user information */
  /** @see https://next-auth.js.org/adapters/prisma */
  adapter: PrismaAdapter(prisma),
  providers: [
    getGoogleProvider({
      clientId: opts.googleClientId,
      clientSecret: opts.googleClientSecret,
    }),
    getAzureAdProvider({
      clientId: opts.azureAdClientId,
      clientSecret: opts.azureAdClientSecret,
      tenantId: opts.azureAdTenantId,
    }),
  ],

  /** Secret used to encrypt and hash tokens */
  /** @see https://next-auth.js.org/configuration/options#secret */
  secret: opts.secret,

  /**  Session options */
  /** @see https://next-auth.js.org/configuration/options#session */
  session: { strategy: "jwt" },

  /** Callbacks used to control actions */
  /** @see https://next-auth.js.org/configuration/callbacks */
  callbacks: {
    // JWT is called first, whatever we return is passed to the session callback
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        return {
          accessToken: account.access_token,
          // TODO: Look into if Azure has `expires_in`,
          // if so we can augment the type to always be defined
          accessTokenExpires: Date.now() + (account.expires_at ?? 0) * 1_000,
          refreshToken: account.refresh_token,
          user,
        };
      }

      // Check if token is still active
      if (
        token &&
        token.accessTokenExpires &&
        token.accessTokenExpires >= Date.now()
      ) {
        return token;
      }

      // Refresh token
      return refreshAccessToken(token, opts);
    },
    // session callback is called after the JWT callback, and it's return value is passed to the client
    session({ token, session, user }) {
      return {
        ...session,
        user: {
          ...user,
          //id: user.id,
        },
        accessToken: token.accessToken,
      };
    },
  },
});
