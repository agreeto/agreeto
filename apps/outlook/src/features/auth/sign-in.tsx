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
    <div className="grid w-full h-full space-y-2 place-content-center">
      <h1 className="text-2xl font-medium">Sign in to use the extension.</h1>
      <button
        className="p-4 font-medium text-white bg-indigo-600 border-2 border-indigo-700 rounded-lg hover:bg-indigo-700"
        onClick={signIn}
      >
        Sign In
      </button>
    </div>
  );
};
