const signIn = () => {
  const signInUrl = `${process.env.PLASMO_PUBLIC_WEB_URL}/api/auth/signin`;
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
      <button
        className="p-4 font-medium text-white bg-indigo-600 border-2 border-indigo-700 rounded-lg hover:bg-indigo-700"
        onClick={signIn}
      >
        Sign In
      </button>
    </div>
  );
};
