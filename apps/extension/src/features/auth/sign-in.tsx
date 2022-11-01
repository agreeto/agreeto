const signIn = () => {
  window.open(
    `http://localhost:3000/api/auth/signin?${new URLSearchParams({
      callbackUrl: `${process.env.PLASMO_PUBLIC_WEB_URL}/auth/extension`
    })}`
  )
}

export const SignIn = () => {
  return (
    <div className="w-full h-full grid place-content-center space-y-2">
      <h1 className="text-2xl font-medium">Sign in to use the extension.</h1>
      <button
        className="text-white font-medium bg-indigo-600 border-indigo-700 border-2 hover:bg-indigo-700 rounded-lg p-4"
        onClick={signIn}>
        Sign In
      </button>
    </div>
  )
}
