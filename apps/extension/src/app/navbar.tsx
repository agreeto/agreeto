import { CalendarDaysIcon, Cog8ToothIcon } from "@heroicons/react/20/solid";
import { Link } from "@tanstack/react-router";

export const Navbar = () => {
  return (
    <div className="flex flex-col flex-1 pb-4 overflow-y-auto bg-white border-r border-gray-200 h-full">
      <div className="p-4 border-b">
        <img
          className="h-8 w-8"
          src="https://localhost:3000/icon512.png"
          alt="AgreeTo"
        />
      </div>
      <div className="flex flex-col flex-grow">
        <nav
          className="flex flex-col flex-1 gap-2 bg-white items-center"
          aria-label="Sidebar"
        >
          <Link to="/calendar">
            <CalendarDaysIcon className="h-10 w-10 p-1 text-indigo-600 hover:text-indigo-700" />
          </Link>
          <Link to="/settings">
            <Cog8ToothIcon className="h-10 w-10 p-1 text-indigo-600 hover:text-indigo-700" />
          </Link>
        </nav>
      </div>
    </div>
  );
};
