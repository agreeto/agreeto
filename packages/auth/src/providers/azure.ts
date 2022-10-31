import AzureAdProvider from "next-auth/providers/azure-ad";

type Options = {
  clientId: string;
  clientSecret: string;
  tenantId: string;
};

export const getAzureAdProvider = (opts: Options) =>
  AzureAdProvider({
    clientId: opts.clientId,
    clientSecret: opts.clientSecret,
    tenantId: opts.tenantId,
  });
