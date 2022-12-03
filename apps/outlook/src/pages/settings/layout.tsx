import { Link, Outlet } from "@tanstack/react-router";

export const SettingsLayout = () => {
  return (
    <div className="mx-2 w-full">
      <h2 className="px-3 pt-3 pb-1 text-xl font-bold text-gray-600">
        Settings
      </h2>

      <div className="flex gap-2 text-gray-600 shadow-[inset_0_-1px_0_0_#d6d6d6]">
        <Link
          to="/settings/subscription"
          className="text-semibold flex h-10 items-center px-3 pb-[2px]"
          activeProps={{
            className: "border-b-2 border-primary pb-0 text-primary",
          }}
        >
          Subscription
        </Link>
        <Link
          to="/settings/signout"
          className="text-semibold flex h-10 items-center px-3 pb-[2px]"
          activeProps={{
            className: "border-b-2 border-primary pb-0 text-primary",
          }}
        >
          Sign Out
        </Link>
      </div>

      <div className="mt-2">
        <Outlet />
      </div>
    </div>
  );
};
