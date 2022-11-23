import { Button } from "@agreeto/ui";

import { signOut } from "~features/auth";

export const SettingsPage = () => {
  return (
    <div className="w-full">
      <Button className="w-24" onClick={signOut}>
        Sign Out
      </Button>
    </div>
  );
};
