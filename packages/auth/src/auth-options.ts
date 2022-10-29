import { prisma } from "@agreeto/db";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AzureAdProvider from "next-auth/providers/azure-ad";

type GetAuthOptions = (opts: {
  secret: string;
  googleClientId: string;
  googleClientSecret: string;
  azureAdClientId: string;
  azureAdClientSecret: string;
  azureAdTenantId: string;
}) => NextAuthOptions;

export const getAuthOptions: GetAuthOptions = (opts) => ({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: opts.googleClientId,
      clientSecret: opts.googleClientSecret,
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
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }

      return session; // The return type will match the one returned in `useSession()`
    },
  },
});
