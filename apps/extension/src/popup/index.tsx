// note (richard): import order is important to not run into specificity issues
import "@fullcalendar/common/main.css";
import "@fullcalendar/timegrid/main.css";
import "../style.css";

import { Spinner } from "@agreeto/ui";
import { Outlet, RouterProvider } from "@tanstack/react-router";

import { Layout } from "~app/layout";
import { useIsAuthed } from "~features/auth/is-authed";
import { SignIn } from "~features/auth/sign-in";
import { router } from "~features/router/config";
import { TRPCProvider } from "~features/trpc//api/provider";

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

  return (
    <RouterProvider router={router}>
      {/* maximum size of popup */}
      <div className="w-[800] h-[600]">
        {isAuthenticating ? (
          <div className="grid w-full h-full place-content-center">
            <div className="h-12">
              <Spinner />
            </div>
          </div>
        ) : isAuthed ? (
          /** THE ACTUAL APP */
          <Layout>
            <Outlet />
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
