import React from "react";

import { trpcApi } from "~features/trpc/api/hooks";
import { storage } from "~features/trpc/chrome/storage";

/**
 * Custom hook to get the accessToken from storage
 * and validate it with the server
 * @returns boolean whether the token is valid or not
 */
export const useIsAuthed = () => {
  const [isAuthed, setIsAuthed] = React.useState(false);
  const [isAuthenticating, setisAuthenticating] = React.useState(true);

  const validateToken = trpcApi.session.validate.useMutation({
    onSuccess() {
      setIsAuthed(true);
    },
    onSettled() {
      setisAuthenticating(false);
    },
    onError() {
      setIsAuthed(false);
    },
  });

  // Validate the token on server
  React.useEffect(() => {
    storage.get("accessToken").then((token) => {
      validateToken.mutate({ token });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isAuthed, isAuthenticating };
};
