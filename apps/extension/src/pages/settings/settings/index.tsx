import { Button } from "@agreeto/ui";

export const SettingsPage = () => {
  return (
    <div className="w-full">
      <Button
        className="w-32"
        onClick={() => {
          window.open(`${process.env.PLASMO_PUBLIC_WEB_URL}/auth/signout`);
        }}
      >
        Sign Out
      </Button>
    </div>
  );
};
