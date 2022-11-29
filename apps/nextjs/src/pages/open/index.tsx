import { type NextPage } from "next";
import { useEffect } from "react";

const OpenPage: NextPage = () => {
  useEffect(() => {
    const interval = setInterval(() => {
      const extension = document.getElementById("all-pages-shadow-host");
      if (extension) {
        clearInterval(interval);
        extension.style.display = "flex";
      }
    }, 100);
  }, []);

  return <div />;
};

export default OpenPage;
