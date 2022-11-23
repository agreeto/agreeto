import { Link, Outlet } from "@tanstack/react-router";

export const Settings = () => {
  return (
    <div className="w-full">
      <div className="flex items-center gap-4 border-b border-gray-200 h-16 flex-1 py-4">
        <h2 className="text-xl font-bold pl-2">Settings</h2>
      </div>

      <div className="flex gap-2 px-3 py-1 border-gray-600">
        <Link
          to="/settings/subscription"
          activeProps={{ className: "rounded-md border border-primary" }}
        >
          Subscription
        </Link>
        <Link
          to="/settings/settings"
          activeProps={{ className: "rounded-md border border-primary" }}
        >
          Settings
        </Link>
      </div>

      <Outlet />
    </div>
  );
};
