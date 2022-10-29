import { NextPage } from "next";
import { signOut, useSession } from "next-auth/react";
// import { useRouter } from "next/router";
// import { useEffect } from "react";

// const initialised = false;
const Success: NextPage = () => {
  //   const router = useRouter();
  //   useEffect(() => {
  //     if (initialised) return;
  //     signOut({ callbackUrl: "/", redirect: false });
  //     initialised = true;
  //   }, []);

  const session = useSession();
  if (session.status !== "authenticated") {
    return (
      <div>
        <p>👋 See you soon!</p>
        <p>You can close this tab now</p>
      </div>
    );
  }
  return (
    <div>
      <p>Are you sure you want to sign out?</p>
      <button onClick={() => signOut({ callbackUrl: "/" })}>Sign out</button>
    </div>
  );
};
export default Success;
