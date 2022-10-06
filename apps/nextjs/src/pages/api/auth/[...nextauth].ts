import { prisma } from "@acme/db";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AzureAdProvider from "next-auth/providers/azure-ad";
import { env as serverEnv } from "../../../env/server.mjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    GoogleProvider({
      clientId: serverEnv.GOOGLE_ID,
      clientSecret: serverEnv.GOOGLE_SECRET,
    }),
    AzureAdProvider({
      clientId: serverEnv.AZURE_AD_CLIENT_ID,
      clientSecret: serverEnv.AZURE_AD_CLIENT_SECRET,
      tenantId: serverEnv.AZURE_AD_TENANT_ID,
    }),
  ],
  secret: serverEnv.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  callbacks: {
    session({ session, token }) {
      // Send accessToken to the client
      session.accessToken = token.accessToken;
      return session; // The return type will match the one returned in `useSession()`
    },
    async jwt({ token, account }) {
      // Persist the OAuth access_token
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
  },
};

export default NextAuth(authOptions);
