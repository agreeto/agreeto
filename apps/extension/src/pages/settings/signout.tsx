import { Button } from "@agreeto/ui";

import { signOut } from "~features/auth/sign-out";

export const SignoutPage = () => {
  return (
    <div className="w-full">
      <Button className="w-32" onClick={signOut}>
        Sign Out
      </Button>
    </div>
  );
};
