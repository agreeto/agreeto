import { openDialog } from "./open-dialog";

export const signIn = () => {
  const url =
    import.meta.env.VITE_API_URL +
    "/api/auth/signin?" +
    new URLSearchParams({
      callbackUrl: import.meta.env.VITE_API_URL + "/auth/outlook",
    });

  openDialog(url);
};

export const SignIn = () => {
  return (
    <div className="grid h-full w-full place-content-center space-y-2">
      <h1 className="text-2xl font-medium">Sign in to use the extension.</h1>
      <button
        className="rounded-lg border-2 border-indigo-700 bg-indigo-600 p-4 font-medium text-white hover:bg-indigo-700"
        onClick={signIn}
      >
        Sign In
      </button>
    </div>
  );
};
