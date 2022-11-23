import {
  type GetServerSideProps,
  type InferGetServerSidePropsType,
  type NextPage,
} from "next";
import { getToken } from "next-auth/jwt";
import { Spinner } from "@agreeto/ui";

import { useEffect, useState } from "react";
import { env as clientEnv } from "../../env/client.mjs";
import { Card } from "../../components/card";

const Extension: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ accessToken }) => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isLoadingExtension, setIsLoadingExtension] = useState(false);

  /**
   * This effect sends the accessToken to the extension,
   * awaits the response, and sets the state accordingly.
   */
  useEffect(() => {
    if (!accessToken) return;
    setIsLoadingExtension(true);

    chrome.runtime.sendMessage(
      clientEnv.NEXT_PUBLIC_EXTENSION_ID,
      { action: "signin", accessToken },
      (res) => {
        setIsLoadingExtension(false);
        if (res.success) {
          setIsSuccess(true);
          setTimeout(() => {
            close();
          }, 2000);
        } else {
          setIsError(true);
        }
      },
    );
  }, [accessToken]);

  return (
    <div className="flex h-screen items-center justify-center">
      <Card disclaimer="This page will close automatically">
        {isLoadingExtension ? (
          // We're still loading the response from the extension
          <div>
            <div className="h-12">
              <Spinner />
            </div>
            <span className="text-gray-600">Verifying...</span>
          </div>
        ) : isSuccess ? (
          // The extension responded with success
          <div>
            <p className="text-xl font-semibold text-green-600">
              You are successfully logged in!
            </p>
            <p className="text-lg text-gray-600">
              You can open your extension now.
            </p>
          </div>
        ) : isError ? (
          // The extension responded with an error
          <div>
            <p className="text-xl font-semibold text-red-600">
              Something went wrong!
            </p>
            <p className="text-lg text-gray-600">Please try again.</p>
          </div>
        ) : (
          // User came here without an accessToken
          <div>
            <p className="text-2xl text-gray-600">
              Seems like you reached this page by mistake.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  /**
   * A bit weird that we're calling a JWT function when using session strategy,
   * but seems to work. Otherwise we'd need a db call to check if the session exists?
   */
  const sessionToken = await getToken({ req, raw: true });

  return {
    props: {
      accessToken: sessionToken,
    },
  };
};

export default Extension;
