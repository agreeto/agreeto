import GoogleProvider from "next-auth/providers/google";

type Options = {
  clientId: string;
  clientSecret: string;
};

export const getGoogleProvider = (opts: Options) =>
  GoogleProvider({
    clientId: opts.clientId,
    clientSecret: opts.clientSecret,
    authorization: {
      params: {
        access_type: "offline",
        prompt: "consent",
        scope: [
          "https://www.googleapis.com/auth/calendar.readonly",
          "https://www.googleapis.com/auth/userinfo.email",
          "https://www.googleapis.com/auth/userinfo.profile",
          "https://www.googleapis.com/auth/calendar.events",
          "https://www.googleapis.com/auth/admin.directory.user.readonly",
        ].join(" "),
      },
    },
  });
