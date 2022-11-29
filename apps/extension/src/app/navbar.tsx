import { CalendarDaysIcon } from "@heroicons/react/20/solid";
import { Link } from "@tanstack/react-location";
import { AiOutlineEdit } from "react-icons/ai";
import { BsGear } from "react-icons/bs";
import { CgProfile } from "react-icons/cg";

export const Navbar = () => {
  return (
    <div className="flex flex-col flex-1 h-full pb-4 overflow-y-auto bg-white border-r border-gray-200">
      <div className="p-4 border-b">
        <img
          className="w-8 h-8"
          src="https://localhost:3000/icon512.png"
          alt="AgreeTo"
        />
      </div>

      {/* a vertical navbar containing icon buttons */}
      <nav className="flex flex-col justify-around flex-1 py-8">
        <Link
          to="calendar"
          className="flex items-center justify-center flex-1 h-16 px-4 text-indigo-9 hover:bg-indigo-2"
        >
          <CalendarDaysIcon className="w-6 h-6" />
        </Link>
        <Link
          to="settings"
          className="flex items-center justify-center flex-1 h-16 px-4 text-indigo-9 hover:bg-indigo-2"
        >
          <BsGear className="w-6 h-6" />
        </Link>
        <Link
          to="accounts"
          className="flex items-center justify-center flex-1 h-16 px-4 text-indigo-9 hover:bg-indigo-2"
        >
          <CgProfile className="w-6 h-6" />
        </Link>
        <Link
          to="formatting"
          className="flex items-center justify-center flex-1 h-16 px-4 text-indigo-9 hover:bg-indigo-2"
        >
          <AiOutlineEdit className="w-6 h-6" />
        </Link>
      </nav>
    </div>
  );
};
