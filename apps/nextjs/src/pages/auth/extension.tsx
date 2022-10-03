import { router } from "@trpc/server";
import {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import { unstable_getServerSession } from "next-auth";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router.js";
import { useEffect, useState } from "react";
import { env as clientEnv } from "../../env/client.mjs";
import { authOptions } from "../api/auth/[...nextauth]";

const Extension: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({}) => {
  const [successExtension, setSuccessExtension] = useState(false);
  const [isLoadingExtension, setIsLoadingExtension] = useState(false);
  const session = useSession();
  const router = useRouter();
  // pass on accessToken to webextension
  useEffect(() => {
    if (session.status !== "authenticated") return;
    setIsLoadingExtension(true);
    chrome.runtime.sendMessage(
      clientEnv.NEXT_PUBLIC_EXTENSION_ID,
      { accessToken: session.data.accessToken },
      (response) => {
        console.log({ response });
        setSuccessExtension(() => response);
        setIsLoadingExtension(() => false);
        // TODO: the callback should be: /auth/success -- maybe add this?
        if (response.success) {
          router.push("/auth/success");
        } else {
          router.push("/auth/error");
        }
      }
    );
  }, [session.status, session.data?.accessToken]);

  // loader
  if (session.status === "loading") return <div>Preparing...</div>;
  // this shouldn't happen?
  if (session.status === "unauthenticated")
    return <div>Error! Something went wrong.</div>;
  // nextauth is now authenticated 👇
  // now, let's wait for our extension to respons successfully about our stored token
  if (isLoadingExtension) return <div>Updating your extension...</div>;
  // shit, the extension responded badly. :( and now?
  if (!successExtension)
    return <div>Error! Something went wrong at the last mile. </div>;
  // ✅ successfully logged-in!
  return <div>Successfully signed in!</div>;
};
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );
  console.log("--gSSP--");
  console.dir(session);
  console.log("--gSSP--");

  return {
    props: {
      session,
    },
  };
}

export default Extension;
