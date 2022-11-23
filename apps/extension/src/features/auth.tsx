import { Outlet } from "@tanstack/react-router";

import { useStorage } from "@plasmohq/storage/hook";

import { AccessTokenValidator, storage } from "~features/trpc/chrome/storage";

// UTILS
export const signOut = async () => {
  // reset accessToken & session
  await storage.set("accessToken", ""); // how can I set this to undefined?
  await storage.set("session", {});

  // TODO: broadcast to all tabs?
  // authChannel.postMessage({
  //   action: "logout",
  //   accessToken: accessToken.data
  // })

  // finally, log the browser session out as well
  window.open(`${process.env.PLASMO_PUBLIC_WEB_URL}/auth/signout`);
};

const signIn = () => {
  window.open(
    `${process.env.PLASMO_PUBLIC_WEB_URL}/api/auth/signin?${new URLSearchParams(
      {
        callbackUrl: `${process.env.PLASMO_PUBLIC_WEB_URL}/auth/extension`,
      },
    )}`,
  );
};

export const SignIn = () => {
  // Provide authentication to router
  const [accessTokenValue] = useStorage({
    key: "accessToken",
    isSecret: true,
  });
  const authentication = AccessTokenValidator.safeParse(accessTokenValue);

  if (authentication.success) {
    return <Outlet />;
  }
  return (
    <>
      Not signed in <br />
      <button
        className="text-white bg-blue-500 border border-blue-500 hover:ring hover:ring-yellow-500"
        onClick={signIn}
      >
        Sign in
      </button>
    </>
  );
};

// TODO: This is never rendered
export const SignOut = () => {
  return (
    <>
      Not signed in <br />
      <button
        className="text-white bg-blue-500 border border-blue-500 hover:ring hover:ring-yellow-500"
        onClick={signOut}
      >
        Sign out
      </button>
    </>
  );
};
