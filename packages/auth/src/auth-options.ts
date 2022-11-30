import { prisma } from "@agreeto/db";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AzureAdProvider from "next-auth/providers/azure-ad";
import { azureScopes, googleScopes } from "./scopes";

/**
 * The process.env is loaded from the Next.js application
 * so they should only be set there. No need to have a .env
 * in this auth package.
 * TODO: Maybe do a shared `env` package in the future?
 **/
if (
  !process.env.NEXTAUTH_SECRET ||
  !process.env.GOOGLE_ID ||
  !process.env.GOOGLE_SECRET ||
  !process.env.AZURE_AD_CLIENT_ID ||
  !process.env.AZURE_AD_CLIENT_SECRET
) {
  throw new Error(
    "[@agreeto/auth: auth-options.ts]: NEXTAUTH_SECRET, or another related secret is not set",
  );
}

export const authOptions: NextAuthOptions = {
  /** Use Prisma adapter to persist user information */
  /** @see https://next-auth.js.org/adapters/prisma */
  adapter: PrismaAdapter(prisma),

  /** Built in providers, adjusted to our needs */
  /** @see https://next-auth.js.org/providers */
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      authorization: {
        params: {
          access_type: "offline",
          prompt: "consent",
          scope: googleScopes.join(" "),
        },
      },
    }),
    AzureAdProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
      authorization: {
        params: {
          access_type: "offline",
          prompt: "consent",
          scope: azureScopes.join(" "),
        },
      },
    }),
  ],

  /** Callbacks used to control actions */
  /** @see https://next-auth.js.org/configuration/callbacks */
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        /** @see next-auth.d.ts */
        session.user.id = user.id;
        session.user.membership = user.membership;
        session.user.hasTrialed = user.hasTrialed;
      }
      return session;
    },
  },

  /** Events used to control actions */
  /** @see https://next-auth.js.org/configuration/events */
  events: {
    // REVIEW: I don't know if this is the proper way to do this?
    async linkAccount({ account, user, profile }) {
      if (!account.provider || !account.providerAccountId || !profile.email) {
        // should not happen for the providers we are using
        console.error("Provider didn't send the required data");
        console.log({ account, user, profile });
        return;
      }

      // Grab user from DB, we need to read the accounts length to
      // determine if this is the first account -> assign primary
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: { accounts: true },
      });

      await prisma.account.update({
        where: {
          provider_providerAccountId: {
            provider: account.provider,
            providerAccountId: account.providerAccountId,
          },
        },
        data: {
          // Set email to the one from the oauth provider's profile
          email: profile.email,
          // Set primary if this is the first account
          userPrimary:
            dbUser && dbUser.accounts.length <= 1
              ? { connect: { id: dbUser.id } }
              : undefined,
        },
      });

      return;
    },
  },

  /** Pages used to override the default ones */
  /** @see https://next-auth.js.org/configuration/pages */
  pages: {
    signIn: "/auth/signin",
  },
};
