import { Outlet, RouterProvider } from "@tanstack/react-router";
import { useIsAuthed } from "../auth/is-authed";
import { SignIn } from "../auth/sign-in";
import { router } from "../router/config";
import { Layout } from "./layout";

export const App = () => {
  const { isAuthed, isAuthenticating } = useIsAuthed();

  return (
    <RouterProvider router={router}>
      {isAuthenticating ? (
        <div className="grid h-full w-full place-content-center">
          <div className="h-12 w-12 animate-pulse rounded-full border-2"></div>
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
    </RouterProvider>
  );
};
