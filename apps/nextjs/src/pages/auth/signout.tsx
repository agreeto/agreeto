import { Card } from "../../components/card";
import { clientEnv } from "../../env/schema.mjs";
import { Button } from "@agreeto/ui";
import { type NextPage } from "next";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";

const Success: NextPage = () => {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const query = router.query;

    if (query.success === "true") {
      // alert extension
      chrome.runtime.sendMessage(
        clientEnv.NEXT_PUBLIC_EXTENSION_ID as string,
        { action: "signout" },
        (response) => {
          if (response.success) {
            // log out the apps/web using NextAuth
            router.push("/auth/success?action=signout");
          } else {
            toast("Something went wrong. Please try again.", {
              type: "error",
              position: "top-center",
            });
          }
        },
      );
    }
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <Card title="Welcome back next time!">
        <p>Are you sure you&apos;d like to sign out?</p>
        <Button
          className="w-full"
          disabled={status !== "authenticated"}
          onClick={() => signOut({ callbackUrl: "/auth/signout?success=true" })}
        >
          Sign Out
        </Button>
      </Card>
      <ToastContainer />
    </div>
  );
};
export default Success;
