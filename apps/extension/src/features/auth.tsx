import { QueryOptions, useQuery } from "@tanstack/react-query"
import { signIn, signOut } from "next-auth/react"
import { z } from "zod"

// import { env } from "../../env/client.mjs"

// SCHEMAS
// export const SessionSchema = z.object({
//   expires: z.string(),
//   user: z
//     .object({
//       id: z.string().optional().nullable(),
//       name: z.string().optional().nullable(),
//       email: z.string().email().optional().nullable(),
//       image: z.string().url().optional().nullable()
//     })
//     .optional()
// })
export const AccessTokenSchema = z.object({
  accessToken: z.string()
})

// HOOKS
export const useAccessTokenExtension = (
  options?: QueryOptions<z.infer<typeof AccessTokenSchema>>
) => {
  return useQuery(
    // TODO: remove magic string
    ["accessToken"],
    async () => {
      // TODO: remove magic string
      const storageUnsafe = await chrome.storage.sync.get("accessToken")
      return AccessTokenSchema.parse(storageUnsafe)
    },
    options
  )
}

// COMPONENTS
export const AuthButton: React.FC = () => {
  const accessToken = useAccessTokenExtension()
  console.log(accessToken.data)

  if (accessToken?.data) {
    return (
      <>
        Signed in as {JSON.stringify(accessToken.data)} <br />
        <button onClick={() => signOut()}>Sign out</button>
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
