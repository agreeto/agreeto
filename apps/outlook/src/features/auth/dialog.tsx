import React from "react";

export const AuthDialog: React.FC = () => {
  React.useEffect(() => {
    const loc = window.location.search;
    const params = new URLSearchParams(loc);
    const provider = params.get("provider");

    window.location.href = `${
      import.meta.env.VITE_API_URL
    }/api/auth/signin?redirectUrl=${encodeURIComponent(
      window.location.origin
    )}&provider=${provider}`;
  }, []);

  return (
    <div className="font-semibold text-xl text-center pt-16 h-screen">
      Redirecting...
    </div>
  );
};
