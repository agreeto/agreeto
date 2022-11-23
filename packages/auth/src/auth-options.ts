import { prisma } from "@agreeto/db";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AzureAdProvider from "next-auth/providers/azure-ad";
import { azureScopes, googleScopes } from "./scopes";
import { type AdapterAccount } from "next-auth/adapters";

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
  !process.env.AZURE_AD_CLIENT_SECRET ||
  !process.env.AZURE_AD_TENANT_ID
) {
  throw new Error("NEXTAUTH_SECRET is not set");
}

export const authOptions: NextAuthOptions = {
  /** Use Prisma adapter to persist user information */
  /** @see https://next-auth.js.org/adapters/prisma */
  adapter: {
    ...PrismaAdapter(prisma),
    // Override the adapter to add `color` field
    async linkAccount(account) {
      const currentAccounts = await prisma.account.findMany({
        where: { userId: account.userId },
        include: { color: true },
      });

      const colors = await prisma.accountColor.findMany({
        orderBy: { order: "asc" },
      });
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      let colorId = colors[0]!.id;

      if (currentAccounts.length > 0) {
        let assignedANewColor = false;
        colors.forEach((color) => {
          if (assignedANewColor) return;
          const foundColor = currentAccounts.find(
            (a) => a.colorId === color.id,
          );
          if (!foundColor) {
            colorId = color.id;
            assignedANewColor = true;
          }
        });
      }

      const newAccount = await prisma.account.create({
        data: {
          ...account,
          userId: undefined,
          user: {
            connect: {
              id: account.userId,
            },
          },
          color: {
            connect: {
              id: colorId,
            },
          },
        },
      });
      return newAccount as unknown as AdapterAccount;
    },
  },

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
      // tenantId: process.env.AZURE_AD_TENANT_ID,
      authorization: {
        params: {
          access_type: "offline",
          prompt: "consent",
          scope: azureScopes.join(" "),
        },
      },
    }),
  ],

  /** Secret used to encrypt and hash tokens */
  /** @see https://next-auth.js.org/configuration/options#secret */
  secret: process.env.NEXTAUTH_SECRET,

  /** Callbacks used to control actions */
  /** @see https://next-auth.js.org/configuration/callbacks */
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
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

      const dbUser = await prisma.user.findUnique({
        where: {
          id: user.id,
        },
        include: {
          accounts: true,
        },
      });
      const dbAccount = await prisma.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider: account.provider,
            providerAccountId: account.providerAccountId,
          },
        },
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
          // Set the user's primary account to dbAccount if it's not already
          userPrimary: {
            connect: {
              // note (richard): the type is optional but the assumption is that NextAuth run adapter.linkAccount *before* event.linkAccount
              // therefore assuming that one of the below should exist at runtime.
              accountPrimaryId: dbUser?.accountPrimaryId || dbAccount?.id,
            },
          },
        },
      });
    },
  },
};
