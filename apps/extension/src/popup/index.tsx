// note (richard): import order is important to not run into specificity issues
import "@fullcalendar/common/main.css";
import "@fullcalendar/timegrid/main.css";
import "../style.css";

import { Button, Spinner } from "@agreeto/ui";
import { Outlet, RouterProvider } from "@tanstack/react-router";

import { Layout } from "~app/layout";
import { useIsAuthed, useValidateTrialOrSub } from "~features/auth/is-authed";
import { SignIn } from "~features/auth/sign-in";
import { router } from "~features/router/config";
import { TRPCProvider } from "~features/trpc//api/provider";
import { trpcApi } from "~features/trpc/api/hooks";

/**
 * The IndexPopup is the entry-file for the popup script of the extension.
 *
 * It provides the app w/ all global configurations via provicers, e.g.:
 * - trpc
 * - react-query
 *
 * *Before* rendering the providers with the App inside it, it checks authentication.
 * If the user is not authenticated, it will render only the SignIn page
 *
 * @returns `<SignIn />` Page OR `<App/>` wrapped in JSX Providers
 */
const PopupContent: React.FC = () => {
  const { isAuthed, isAuthenticating } = useIsAuthed();
  const { component, isValidating } = useValidateTrialOrSub();

  return (
    <RouterProvider router={router}>
      {/* maximum size of popup */}
      <div className="w-[800] h-[600]">
        {isAuthenticating || isValidating ? (
          <div className="grid w-full h-full place-content-center">
            <div className="h-12">
              <Spinner />
            </div>
          </div>
        ) : isAuthed ? (
          /** THE ACTUAL APP */
          <Layout>
            {component === "outlet" ? (
              <Outlet />
            ) : component === "startTrial" ? (
              <StartTrialScreen />
            ) : component === "endTrial" ? (
              <EndTrialScreen />
            ) : component === "endSubscription" ? (
              <EndSubscriptionScreen />
            ) : null}
          </Layout>
        ) : (
          /** OR: SIGN IN */
          <SignIn />
        )}
      </div>
    </RouterProvider>
  );
};

/** Content needs access to the tRPC context, so we need a wrapper */
const IndexPopup: React.FC = () => {
  return (
    <TRPCProvider>
      <PopupContent />
    </TRPCProvider>
  );
};

export default IndexPopup;

/**
 * I think we have these components as modals somewhere?
 */
const StartTrialScreen = () => {
  const utils = trpcApi.useContext();
  const { mutate: startTrial } = trpcApi.user.startTrial.useMutation({
    onSettled() {
      utils.user.validateTrialOrSub.invalidate();
    },
  });

  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold">Welcome to AgreeTo</h1>
      <p className="text-xl">We just put you on our trial plan for 7 days</p>
      <span>INSERT ACCOUNT STUFF HERE</span>
      <Button onClick={() => startTrial()}>Continue</Button>
    </div>
  );
};

const EndTrialScreen = () => {
  const utils = trpcApi.useContext();
  const { mutate: endTrial } = trpcApi.user.endTrial.useMutation({
    onSettled() {
      utils.user.validateTrialOrSub.invalidate();
    },
  });

  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold">Your trial has ended</h1>
      <p className="text-xl">Please subscribe to continue using the app</p>
      <span>INSERT ACCOUNT SELECTOR HERE</span>
      <Button onClick={() => endTrial()}>Consent</Button>
    </div>
  );
};

const EndSubscriptionScreen = () => {
  const utils = trpcApi.useContext();
  const { mutate: endSubscription } = trpcApi.user.endSubscription.useMutation({
    onSettled() {
      utils.user.validateTrialOrSub.invalidate();
    },
  });

  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold">Your subscription has ended</h1>
      <p className="text-xl">Please subscribe to continue using the app</p>
      <span>INSERT ACCOUNT SELECTOR HERE</span>
      <Button onClick={() => endSubscription()}>Consent</Button>
    </div>
  );
};
