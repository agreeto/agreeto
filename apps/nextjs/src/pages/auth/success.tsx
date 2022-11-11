import { type NextPage } from "next";
import Image from "next/image";
import { useEffect } from "react";

const Success: NextPage = () => {
  useEffect(() => {
    setTimeout(() => close(), 1500);
  }, []);

  return (
    <div className="h-screen pt-16 text-center text-xl font-semibold">
      <div className="my-16 flex items-center justify-center">
        <div className="relative h-20 w-20">
          <Image src="/icon512.png" alt="AgreeTo" layout="fill" />
        </div>
        <h1 className="color-primary ml-2 text-4xl font-semibold text-[#2e81ff]">
          AgreeTo
        </h1>
      </div>
      <p className="text-2xl text-green-600">You are successfully logged in!</p>
      <br />
      <p className="text-lg text-gray-600">You can open your extension now.</p>
      <p className="text-lg text-gray-600">
        This page will close automatically.
      </p>
    </div>
  );
};
export default Success;
