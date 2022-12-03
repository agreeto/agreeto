import { Button } from "@agreeto/ui";
import { useEffect } from "react";

import { Navbar } from "~app/navbar";
import { useValidateTrialOrSub } from "~features/auth/is-authed";
import { trpcApi } from "~features/trpc/api/hooks";

export const Layout: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  // Check that trial/subscription are valid
  const renderComponent = useValidateTrialOrSub();

  const utils = trpcApi.useContext();
  useEffect(() => {
    // prefetch subscription
    utils.user.subscription.prefetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex w-full h-full">
      <aside className="w-1/12">
        <Navbar />
      </aside>
      {/* - 👇 inject the `children` here 👇 */}
      <main className="flex justify-center flex-1 w-11/12 overflow-y-hidden">
        {renderComponent === "children" ? (
          children
        ) : renderComponent === "startTrial" ? (
          <StartTrialScreen />
        ) : renderComponent === "endTrial" ? (
          <EndTrialScreen />
        ) : renderComponent === "endSubscription" ? (
          <EndSubscriptionScreen />
        ) : null}
      </main>
    </div>
  );
};

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
  const { mutate: endSubscription } = trpcApi.user.endTrial.useMutation({
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
