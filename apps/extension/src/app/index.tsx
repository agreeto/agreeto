import { Link, Outlet, RouterProvider } from "@tanstack/react-router";

import { useIsAuthed } from "~features/auth/is-authed";
import { SignIn } from "~features/auth/sign-in";
import { router } from "~features/router/config";
import { TRPCProvider } from "~features/trpc/api/provider";

import { Layout } from "./layout";

const AppContent: React.FC = () => {
  const isAuthed = useIsAuthed();

  return (
    <RouterProvider router={router}>
      <Link to=""></Link>
      <div className="h-[600] w-[800]">
        {isAuthed ? (
          // Render app layout if user is authed
          <Layout>
            <Outlet />
          </Layout>
        ) : (
          // Render sign in page if user is not authed
          <SignIn />
        )}
      </div>
    </RouterProvider>
  );
};

export const App: React.FC = () => {
  return (
    <TRPCProvider>
      <AppContent />
    </TRPCProvider>
  );
};
