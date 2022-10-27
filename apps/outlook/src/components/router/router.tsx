import { FC } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AuthDialog from "../../pages/auth-dialog";
import Taskpane from "../../pages/taskpane";
import Layout from "../layout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Taskpane />,
  },
  {
    path: "/auth-dialog",
    element: <AuthDialog />,
  },
  {
    path: "/app",
    element: <Layout />,
  },
]);

const Router: FC = () => {
  return <RouterProvider router={router} />;
};

export default Router;
