import { type NextPage } from "next";
import Image from "next/image";
import { useEffect } from "react";
import { env } from "../../env/client.mjs";

const Success: NextPage = () => {
  useEffect(() => {
    // Notify extension about the successful payment
    if (chrome?.runtime) {
      chrome.runtime.sendMessage(env.NEXT_PUBLIC_EXTENSION_ID, {
        type: "successful-payment",
      });
    }
  }, []);

  return (
    <div className="h-screen pt-16 text-center text-xl font-semibold">
      <div className="my-16 flex items-center justify-center">
        <div className="relative h-20 w-20">
          <Image src="/icon512.png" alt="AgreeTo" layout="fill" />
        </div>
        <h1 className="ml-2 text-4xl font-semibold text-primary">AgreeTo</h1>
      </div>
      <p className="text-2xl text-green-600">Thank you for your purchase!</p>
      <br />
      <p className="text-lg text-gray-600">
        You can open your extension now and access your premium features.
      </p>
      <p className="text-lg text-gray-600">You can close this window.</p>
    </div>
  );
};
export default Success;
