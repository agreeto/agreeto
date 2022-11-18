import { type GetServerSideProps } from "next";
import { getToken } from "next-auth/jwt";
import { env } from "../../env/client.mjs";

const OutlookRedirect = () => {
  // Should never be rendered
  return <div>Redirecting...</div>;
};

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const sessionToken = await getToken({ req, raw: true });

  const redirect = sessionToken
    ? "/signin-redirect.html"
    : "/signout-redirect.html";

  return {
    props: {},
    redirect: {
      destination: `${env.NEXT_PUBLIC_OUTLOOK_ADDIN_URL}${redirect}?token=${sessionToken}`,
      permanent: false,
    },
  };
};

export default OutlookRedirect;
