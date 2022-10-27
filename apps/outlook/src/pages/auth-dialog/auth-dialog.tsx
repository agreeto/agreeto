import { FC, useEffect } from "react";
import { API_URL } from "../../utils/constants";

type Props = {};

const AuthDialog: FC<Props> = () => {
  useEffect(() => {
    const loc = window.location.search;
    const params = new URLSearchParams(loc);
    const provider = params.get("provider");

    window.location.href = `${API_URL}/api/auth/signup?provider=${provider}&client=addin`;
  }, []);

  return (
    <div className="font-semibold text-xl text-center pt-16 h-screen">
      Redirecting...
    </div>
  );
};

export default AuthDialog;
