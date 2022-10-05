import { useEffect } from "react"
import { z } from "zod"

import { storage } from "./storage"

// SCHEMAS
export const Session = z.object({
  expires: z.string(),
  user: z.object({
    id: z.string().optional().nullable(),
    name: z.string().optional().nullable(),
    email: z.string().email().optional().nullable(),
    image: z.string().url().optional().nullable()
  })
})
export const AccessToken = z.string()

// UTILS
export const signOut = async () => {
  // reset accessToken & session
  await storage.set("accessToken", "") // how can I set this to undefined?
  await storage.set("session", {})

  // TODO: broadcast to all tabs?
  // authChannel.postMessage({
  //   action: "logout",
  //   accessToken: accessToken.data
  // })

  // finally, log the browser session out as well
  window.open(`http://localhost:3000/auth/signout`)
}

// PROVIDER
// const SessionProviderExtension = ({children}) => {
//   // TODO: implement useBroadcast hook that returns the instance of new BroadcastChannel()
//   const authChannel = useBroadcastChannel("authChannel")
//   // this useEffect makes sure to log out the extension element even if it was initiated from another tab
//   useEffect(() => {
//     authChannel.onmessage = (e) => {
//       if (e.data.action === "logout") {
//         signOut()
//       }
//     }
//   }, [])
// return children
// }

// HOOKS
// TODO: write useSession hook w/:
// const useSession = () => {
//   const [sessionValue, setSession] = useStorage("session")
//   const session = ChromeStorage.session.parse(sessionValue)
//   return { ...session }
// }

// export const useAccessTokenExtension = (
//   options?: QueryOptions<z.infer<typeof AccessTokenSchema>>
// ) => {
//   return useQuery(
//     // TODO: remove magic string
//     ["accessToken"],
//     async () => {
//       // TODO: remove magic string
//       const storageUnsafe = await chrome.storage.sync.get("accessToken")
//       return AccessTokenSchema.parse(storageUnsafe)
//     },
//     options
//   )
// }

// COMPONENTS
// const authChannel = new BroadcastChannel("auth")
// const sessionStatus = atom<Omit<SessionContextValue["status"], "loading">>(0)

// export const AuthButton: React.FC<{session: Session}> = () => {
//   const [_,setSession] = useStorage<Session | undefined>("session")

//   const onLogout = (): void => {
//     setSession(
//       (session) => undefined
//     )
//   }

//   // this useEffect makes sure to log out the extension element even if it was initiated from another tab
//   // useEffect(() => {
//   //   authChannel.onmessage = (e) => {
//   //     if (e.data.action === "logout") {
//   //      onLogout()
//   //     }
//   //   }
//   // }, [])

//   if (accessToken?.data) {
//     return (
//       <>
//         Signed in as {JSON.stringify(accessToken.data)} <br />
//         <button
//           onClick={() => {
//             // log the user out
//             onLogout()
//             // broadcast the logout to all other open tabs
//             // authChannel.postMessage({
//             //   action: "logout",
//             //   accessToken: accessToken.data
//             // })
//           }}>
//           Sign out
//         </button>
//       </>
//     )
//   }
//   return (
// <>
//   Not signed in <br />
//   <button
//     className="border border-blue-500 hover:ring hover:ring-yellow-500 bg-blue-500 text-white"
//     onClick={() => {
//       window.open(
//         `http://localhost:3000/api/auth/signin?${new URLSearchParams({
//           callbackUrl: `${process.env
//             .PLASMO_PUBLIC_WEB_URL!}/auth/extension`
//         })}`
//       )
//     }}>
//     Sign in
//   </button>
// </>
//   )
// }

export const SignIn = () => {
  return (
    // max width & height of popup as per https://stackoverflow.com/a/8983678/5608461
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
