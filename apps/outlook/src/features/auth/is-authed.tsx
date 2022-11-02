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
    retry: 0,
    onSuccess() {
      setIsAuthed(true);
      setIsAuthenticating(false);
    },
    async onError() {
      // TODO: call with trpc-chrome, update others?
      // await storage.set("accessToken", "")
    },
    onSettled() {
      setIsAuthenticating(false);
    },
  });

  // Validate the token on server
  React.useEffect(() => {
    const token = window?.localStorage.getItem("token") ?? "";
    validateToken.mutate({ token });
    console.log("firing mutation");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isAuthed, isAuthenticating };
};
