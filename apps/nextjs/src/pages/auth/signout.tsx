import { Button } from "@agreeto/ui";
import { type NextPage } from "next";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { Card } from "../../components/card";
import { clientEnv } from "../../env/schema.mjs";

const Success: NextPage = () => {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const query = router.query;

    if (query.success === "true") {
      // alert extension
      chrome.runtime.sendMessage(
        clientEnv.NEXT_PUBLIC_EXTENSION_ID as string,
        "signout",
        (response) => {
          if (response.success) {
            // log out the apps/web using NextAuth
            router.push("/auth/success?action=signout");
          } else {
            // TODO: add error page, or just a toast?
            // router.push("/auth/error");
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
    </div>
  );
};
export default Success;
