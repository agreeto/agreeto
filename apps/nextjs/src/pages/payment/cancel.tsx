import { type NextPage } from "next";
import Image from "next/image";

const Success: NextPage = () => {
  return (
    <div className="h-screen pt-16 text-center text-xl font-semibold">
      <div className="my-16 flex items-center justify-center">
        <div className="relative h-20 w-20">
          <Image src="/icon512.png" alt="AgreeTo" layout="fill" />
        </div>
        <h1 className="ml-2 text-4xl font-semibold text-primary">AgreeTo</h1>
      </div>
      <p className="text-2xl text-red-600">
        Whoops, looks like you cancelled your payment.
      </p>
      <br />
      <p className="text-lg text-gray-600">
        If it was unintentional, please try again via the extension.
      </p>
    </div>
  );
};
export default Success;
