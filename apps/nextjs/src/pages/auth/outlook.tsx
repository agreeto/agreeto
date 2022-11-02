import { type GetServerSideProps } from "next";
import { getToken } from "next-auth/jwt";

const OutlookRedirect = () => {
  return <div>Redirecting...</div>;
};

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const sessionToken = await getToken({ req, raw: true });

  console.log("sessionToken", sessionToken);

  return {
    props: {},
    redirect: {
      destination:
        "https://localhost:8082/auth-redirect.html?token=" + sessionToken,
      permanent: false,
    },
  };
};

export default OutlookRedirect;
