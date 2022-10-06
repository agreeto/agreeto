import { NextPage } from "next";
import { useEffect } from "react";

const Success: NextPage = () => {
  useEffect(() => {
    setTimeout(() => close(), 1500);
  }, []);

  return (
    <div>
      <p>Successfully signed in!</p>
      <p>Closing this tab...</p>
    </div>
  );
};
export default Success;
