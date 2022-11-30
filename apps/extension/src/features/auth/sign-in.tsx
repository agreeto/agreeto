import { Button } from "@agreeto/ui";

export const signIn = () => {
  const signInUrl = `${process.env.PLASMO_PUBLIC_WEB_URL}/auth/signin`;
  const callbackUrl = `${process.env.PLASMO_PUBLIC_WEB_URL}/auth/extension`;
  window.open(
    `${signInUrl}?${new URLSearchParams({
      callbackUrl,
    })}`,
  );
};

export const SignIn = () => {
  return (
    <div className="grid w-full h-full space-y-2 place-content-center">
      <h1 className="text-2xl font-medium">Sign in to use the extension.</h1>
      <Button className="h-12 font-medium" onClick={signIn}>
        Sign In
      </Button>
    </div>
  );
};
