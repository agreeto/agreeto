import { prisma } from "@agreeto/db";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AzureAdProvider from "next-auth/providers/azure-ad";
import { refreshAccessToken } from "./refresh-access-token";

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
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: opts.googleClientId,
      clientSecret: opts.googleClientSecret,
      authorization: {
        params: {
          access_type: "offline",
          prompt: "consent",
          scope: [
            "https://www.googleapis.com/auth/calendar.readonly",
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/calendar.events",
            "https://www.googleapis.com/auth/admin.directory.user.readonly",
          ].join(" "),
        },
      },
    }),
    AzureAdProvider({
      clientId: opts.azureAdClientId,
      clientSecret: opts.azureAdClientSecret,
      tenantId: opts.azureAdTenantId,
    }),
  ],
  secret: opts.secret,
  session: { strategy: "jwt" },
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
