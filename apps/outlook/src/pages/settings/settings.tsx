import type { FC } from "react";
import { useLogout } from "services";

type Props = {};

const Settings: FC<Props> = () => {
  const { mutateAsync: logout } = useLogout();

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem("ajwt");
    localStorage.removeItem("rjwt");
    window.close();
  };

  return (
    <button className="button-outline w-60" onClick={handleLogout}>
      Logout
    </button>
  );
};

export default Settings;
