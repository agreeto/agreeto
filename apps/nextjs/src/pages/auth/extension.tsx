import {
  type GetServerSidePropsContext,
  type InferGetServerSidePropsType,
  type NextPage,
} from "next";
import { getToken } from "next-auth/jwt";

// Router can by used in useEffect only (else useRouter instead) - see: https://github.com/vercel/next.js/issues/18127#issuecomment-988959843
import Router from "next/router.js";
import { useEffect, useState } from "react";
import { env as clientEnv } from "../../env/client.mjs";

const Extension: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ accessToken }) => {
  const [successExtension, setSuccessExtension] = useState(false);
  const [isLoadingExtension, setIsLoadingExtension] = useState(false);
  // const session = useSession();

  /**
   * This effect does 3 thigns:
   * 1. if nextauth is authenticated, send the accessToken to our extension
   * 2. Update loading states while doing this do display them to the user in render
   * 3. upon completion of extension messasging, redirect to success/error
   */
  useEffect(() => {
    // if (session.status !== "authenticated") return;
    if (!accessToken) return;
    setIsLoadingExtension(true);
    chrome.runtime.sendMessage(
      clientEnv.NEXT_PUBLIC_EXTENSION_ID,
      { accessToken: accessToken },
      (response) => {
        console.log("response from signing in", response);
        setSuccessExtension(() => response);
        setIsLoadingExtension(() => false);
        if (response.success) {
          Router.push("/auth/success");
        } else {
          Router.push("/auth/error");
        }
      },
    );
  }, [accessToken]);

  /**
   * 1. Display UI while messaging extension
   */
  // let's wait for our extension to respond successfully about our stored token
  if (isLoadingExtension) return <div>Updating your extension...</div>;
  // shit, the extension responded badly. :( and now?
  if (!successExtension)
    return <div>Error! Something went wrong at the last mile. </div>;
  // ✅ successfully logged-in!
  return <div>Successfully signed in!</div>;
};

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  /** A bit weird that we're calling a JWT function when using session strategy,
   * but seems to work. Otherwise we'd need a db call to check if the session exists?
   */
  const sessionToken = await getToken({ req, raw: true });

  return {
    props: {
      accessToken: sessionToken,
    },
  };
}

export default Extension;
