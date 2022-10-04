import { useStorage } from "@plasmohq/storage/hook"

import { signOut } from "~features/auth"
import { ChromeStorage } from "~storage-schema"

export const App = () => {
  const [accessTokenValue] = useStorage({
    key: "accessToken",
    isSecret: true
  })
  const accessToken = ChromeStorage.accessToken.parse(accessTokenValue)
  // const [sessionValue] = useStorage({
  //   key: "session",
  //   isSecret: true
  // })
  // const session = ChromeStorage.session.parse(sessionValue)

  if (accessToken) {
    return (
      <>
        Signed in w/ token: {accessToken} <br />
        <button
          onClick={() => {
            // log the user out
            signOut()
          }}>
          Sign out
        </button>
      </>
    )
  }

  return (
    <>
      Not signed in <br />
      <button
        className="border border-blue-500 hover:ring hover:ring-yellow-500 bg-blue-500 text-white"
        onClick={() => {
          window.open(
            `http://localhost:3000/api/auth/signin?${new URLSearchParams({
              callbackUrl: `${process.env
                .PLASMO_PUBLIC_WEB_URL!}/auth/extension`
            })}`
          )
        }}>
        Sign in
      </button>
    </>
  )
}

export default App
