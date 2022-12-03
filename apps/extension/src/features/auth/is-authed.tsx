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

/**
 * Background job to validate if a trial is valid
 */
export const useValidateTrialOrSub = () => {
  // Assume all good
  const [component, setComponent] = React.useState<
    "children" | "startTrial" | "endTrial" | "endSubscription"
  >("children");

  trpcApi.user.validateTrialOrSub.useQuery(undefined, {
    onSuccess(data) {
      setComponent(
        data.showStartTrial
          ? "startTrial"
          : data.showEndTrial
          ? "endTrial"
          : data.showEndSubscription
          ? "endSubscription"
          : "children",
      );
    },
    // Don't spam the server so we set a longer staleTime
    staleTime: 1000 * 60 * 60 * 30, // 30 minutes
  });
  return component;
};
