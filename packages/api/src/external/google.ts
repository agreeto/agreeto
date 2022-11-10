import { type admin_directory_v1, google } from "googleapis";
import { z } from "zod";

const createGoogleAdmin = ({
  accessToken,
  refreshToken,
}: {
  accessToken: string;
  refreshToken: string;
}) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_ID,
    process.env.GOOGLE_SECRET
  );

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  return google.admin({
    auth: oauth2Client,
    version: "directory_v1",
  });
};

const formatUser = (user: admin_directory_v1.Schema$User) => {
  const validator = z.object({
    id: z.string(),
    name: z.string(),
    surname: z.string(),
    email: z.string().email(),
  });

  const parsed = validator.safeParse(user);
  if (!parsed.success) {
    return null;
  }

  return { ...parsed.data, provider: "google" };
};

type GetGoogleUserOptions = {
  accessToken: string;
  refreshToken: string;
  search: string;
};

type FormattedUser = Exclude<ReturnType<typeof formatUser>, null>;

export const getGoogleUsers = async ({
  accessToken,
  refreshToken,
  search,
}: GetGoogleUserOptions) => {
  const google = createGoogleAdmin({
    accessToken,
    refreshToken,
  });
  const response = await google.users.list({
    customer: "my_customer",
    maxResults: 5,
    orderBy: "email",
    viewType: "domain_public",
    query: search,
  });

  const formatted = (response.data.users ?? [])
    .map((u) => formatUser(u))
    .filter((u): u is FormattedUser => !!u);
  return formatted;
};
