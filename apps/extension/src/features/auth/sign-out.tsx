export const signOut = () => {
  window.open(`${process.env.PLASMO_PUBLIC_WEB_URL}/auth/signout`);
};
