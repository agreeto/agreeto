import React from "react"

import { trpcApi } from "~features/trpc/api/hooks"
import { storage } from "~features/trpc/chrome/storage"

/**
 * Custom hook to get the accessToken from storage
 * and validate it with the server
 * @returns boolean whether the token is valid or not
 */
export const useIsAuthed = () => {
  const [isAuthed, setIsAuthed] = React.useState(false)

  const validateToken = trpcApi.session.validate.useMutation({
    onSuccess() {
      setIsAuthed(true)
    },
    async onError() {
      // TODO: call with trpc-chrome, update others?
      // await storage.set("accessToken", "")
    }
  })

  // Validate the token on server
  React.useEffect(() => {
    storage.get("accessToken").then((token) => {
      console.log(token)
      validateToken.mutate({ token })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return isAuthed
}
