import {
  createMemoryHistory,
  Outlet,
  ReactLocation,
  Router,
} from "@tanstack/react-location";
import { useIsAuthed } from "../auth/is-authed";
import { SignIn } from "../auth/sign-in";
import { getRoutes } from "../router/config";
import { Layout } from "./layout";

const location = new ReactLocation({
  history: createMemoryHistory({
    initialEntries: ["/"], // Pass your initial url
  }),
});

export const App = () => {
  const { isAuthed, isAuthenticating } = useIsAuthed();

  return (
    <Router routes={getRoutes()} location={location}>
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
    </Router>
  );
};
