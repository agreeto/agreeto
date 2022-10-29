import NextAuth from "next-auth";
import { getAuthOptions } from "@agreeto/auth";
import { env } from "../../../env/server.mjs";

const authOptions = getAuthOptions({
  secret: env.NEXTAUTH_SECRET,
  googleClientId: env.GOOGLE_ID,
  googleClientSecret: env.GOOGLE_SECRET,
  azureAdClientId: env.AZURE_AD_CLIENT_ID,
  azureAdClientSecret: env.AZURE_AD_CLIENT_SECRET,
  azureAdTenantId: env.AZURE_AD_TENANT_ID,
});

export default NextAuth(authOptions);
