import { type GetServerSideProps } from "next";
import { getToken } from "next-auth/jwt";
import { env } from "../../env/client.mjs";

const OutlookRedirect = () => {
  return <div>Redirecting...</div>;
};

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const sessionToken = await getToken({ req, raw: true });

  console.log("sessionToken", sessionToken);

  return {
    props: {},
    redirect: {
      destination: `${env.NEXT_PUBLIC_OUTLOOK_ADDIN_URL}/auth-redirect.html?token=${sessionToken}`,
      permanent: false,
    },
  };
};

export default OutlookRedirect;
