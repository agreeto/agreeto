export const signOut = () => {
  const url =
    import.meta.env.VITE_API_URL +
    "/api/auth/signout?" +
    new URLSearchParams({
      callbackUrl: import.meta.env.VITE_API_URL + "/auth/outlook",
    });

  Office.context.ui.displayDialogAsync(
    url,
    {
      height: 50,
      width: 20,
      promptBeforeOpen: false,
    },
    (res) => console.log(res)
  );
};
