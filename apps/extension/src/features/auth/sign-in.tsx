// import { Outlet } from "@tanstack/react-location"

// import { useStorage } from "@plasmohq/storage/hook"

// import { ChromeStorage } from "~features/trpc/chrome/storage"

const signIn = () => {
  window.open(
    `http://localhost:3000/api/auth/signin?${new URLSearchParams({
      callbackUrl: `${process.env.PLASMO_PUBLIC_WEB_URL}/auth/extension`
    })}`
  )
}

export const SignIn = () => {
  // Provide authentication to router
  // const [accessTokenValue] = useStorage({
  //   key: "accessToken",
  //   isSecret: true
  // })
  // if (ChromeStorage.accessToken.safeParse(accessTokenValue).success) {
  //   return <Outlet />
  // }
  return (
    <div className="grid w-full h-full space-y-2 place-content-center">
      <h1 className="text-2xl font-medium">Sign in to use the extension.</h1>
      <button
        className="p-4 font-medium text-white bg-indigo-600 border-2 border-indigo-700 rounded-lg hover:bg-indigo-700"
        onClick={signIn}>
        Sign In
      </button>
    </div>
  )
}
