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
    authorization: {
      params: {
        access_type: "offline",
        prompt: "select_account",
        // TODO: Validate this is the correct scope and that it's working
        // scope: [
        //   "user.read",
        //   "openid",
        //   "profile",
        //   "email",
        //   "offline_access",
        //   "Calendars.Read",
        //   "Calendars.ReadWrite",
        //   "Calendars.Read",
        //   "OnlineMeetings.Read",
        //   "OnlineMeetings.ReadWrite",
        // ].join(" "),
      },
    },
  });
