import { openDialog } from "./open-dialog";

export const signOut = () => {
  const url =
    import.meta.env.VITE_API_URL +
    "/api/auth/signout?" +
    new URLSearchParams({
      callbackUrl: import.meta.env.VITE_API_URL + "/auth/outlook",
    });

  openDialog(url);
};
