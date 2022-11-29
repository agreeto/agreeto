import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { Card } from "../../components/card";

const Success: NextPage = () => {
  const router = useRouter();
  const isSignIn = router.query.action === "signin";

  useEffect(() => {
    setTimeout(() => close(), 2000);
  }, []);

  return (
    <div className="flex h-screen items-center justify-center">
      <Card disclaimer="This page will close automatically.">
        <div>
          <p className="pt-8 text-xl font-semibold text-green-600">
            You are successfully {isSignIn ? "logged in" : "signed out"}!
          </p>
          <p className="text-lg text-gray-600">
            {isSignIn
              ? "You can open your extension now."
              : "Use the extension to sign back in"}
          </p>
        </div>
      </Card>
    </div>
  );
};
export default Success;
