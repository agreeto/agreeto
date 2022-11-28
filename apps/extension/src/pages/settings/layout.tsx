import { Link, Outlet } from "@tanstack/react-router";

export const SettingsLayout = () => {
  return (
    <div className="w-full mx-2">
      <h2 className="text-xl font-bold text-gray-600 pt-3 pb-1 px-3">
        Settings
      </h2>

      <div className="flex text-gray-600 gap-2 shadow-[inset_0_-1px_0_0_#d6d6d6]">
        <Link
          to="/settings/subscription"
          className="text-semibold px-3 h-10 flex items-center pb-[2px]"
          activeProps={{
            className: "border-b-2 border-primary pb-0 text-primary",
          }}
        >
          Subscription
        </Link>
        <Link
          to="/settings/settings"
          className="text-semibold px-3 h-10 flex items-center pb-[2px]"
          activeProps={{
            className: "border-b-2 border-primary pb-0 text-primary",
          }}
        >
          Settings
        </Link>
      </div>

      <div className="mt-2">
        <Outlet />
      </div>
    </div>
  );
};
