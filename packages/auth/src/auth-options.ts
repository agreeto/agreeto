import { prisma } from "@acme/db";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AzureAdProvider from "next-auth/providers/azure-ad";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  // REVIEW: Should we replace process.env. with our env.cjs file? How does it work in packages that depend on app's env vars?
  providers: [
    GoogleProvider({
      // FIXME: include env var dep in turbo.json
      // eslint-disable-next-line
      clientId: process.env.GOOGLE_ID!,
      // FIXME: include env var dep in turbo.json
      // eslint-disable-next-line
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
    AzureAdProvider({
      // FIXME: include env var dep in turbo.json
      // eslint-disable-next-line
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      // FIXME: include env var dep in turbo.json
      // eslint-disable-next-line
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      // FIXME: include env var dep in turbo.json
      // eslint-disable-next-line
      tenantId: process.env.AZURE_AD_TENANT_ID!,
    }),
  ],
  // secret: process.env.NEXTAUTH_SECRET!,
  session: { strategy: "jwt" },
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        // @ts-expect-error: FIXME: Add user to context
        session.user.id = user.id;
      }

      return session; // The return type will match the one returned in `useSession()`
    },
  },
};
