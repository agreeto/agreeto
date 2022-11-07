import React from "react";
import { trpc } from "../trpc/hooks";
/**
 * Custom hook to get the accessToken from storage
 * and validate it with the server
 * @returns boolean whether the token is valid or not
 */
export const useIsAuthed = () => {
  const [isAuthed, setIsAuthed] = React.useState(false);
  const [isAuthenticating, setIsAuthenticating] = React.useState(true);

  const validateToken = trpc.session.validate.useMutation({
    onSuccess() {
      setIsAuthed(true);
    },
    onError() {
      setIsAuthed(false);
    },
    onSettled() {
      setIsAuthenticating(false);
    },
  });

  const storageEventHandler = React.useCallback((e: StorageEvent) => {
    console.log(e);
    if (e.key === "token") {
      validateToken.mutate({ token: e.newValue ?? "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    /** listen for changes on localStorage */
    window.addEventListener("storage", storageEventHandler);
    return () => {
      window.removeEventListener("storage", storageEventHandler);
    };
  }, [storageEventHandler]);

  React.useEffect(() => {
    /** fire mutation on mount */
    const token = localStorage.getItem("token");
    validateToken.mutate({ token: token ?? "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isAuthed, isAuthenticating };
};
