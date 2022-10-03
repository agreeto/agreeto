import { prisma } from "@acme/db";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AzureAdProvider from "next-auth/providers/azure-ad";
import { env } from "../../../env/server.mjs";

console.log("+++++++++++++++++++++");
console.log("+++++++++++++++++++++");
console.dir(env);
console.log("+++++++++++++++++++++");
console.log("+++++++++++++++++++++");
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_ID,
      clientSecret: env.GOOGLE_SECRET,
    }),
    AzureAdProvider({
      clientId: env.AZURE_AD_CLIENT_ID,
      clientSecret: env.AZURE_AD_CLIENT_SECRET,
      tenantId: env.AZURE_AD_TENANT_ID,
    }),
  ],
  session: { strategy: "database" },
  callbacks: {
    session({ session, token, user }) {
      return session; // The return type will match the one returned in `useSession()`
    },
  },
};

export default NextAuth(authOptions);
