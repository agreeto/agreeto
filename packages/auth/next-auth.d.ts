import type { AuthSession } from "@acme/auth";
declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  // FIXME: no-unused-var linter complains about session not being used? Interestingly, it doesn't error in VSCode for nextjs
  // eslint-disable-next-line
  type Session = AuthSession;
}
