import { HiOutlineCalendar } from "react-icons/hi";
import { Link } from "@tanstack/react-router";
import { AiOutlineEdit } from "react-icons/ai";
import { BsGear } from "react-icons/bs";
import { CgProfile } from "react-icons/cg";

export const Navbar = () => {
  return (
    <div className="flex h-full flex-1 flex-col overflow-y-auto border-r border-gray-200 bg-white pb-4">
      <div className="border-b p-4">
        <img
          className="h-8 w-8"
          src="https://localhost:3000/icon512.png"
          alt="AgreeTo"
        />
      </div>

      {/* a vertical navbar containing icon buttons */}
      <nav className="flex flex-1 flex-col justify-around py-8">
        <Link
          to="calendar"
          className="flex h-16 flex-1 items-center justify-center px-4 text-indigo-9 hover:bg-indigo-2"
        >
          <HiOutlineCalendar className="h-6 w-6" />
        </Link>
        <Link
          to="settings/subscription"
          className="flex h-16 flex-1 items-center justify-center px-4 text-indigo-9 hover:bg-indigo-2"
        >
          <BsGear className="h-6 w-6" />
        </Link>
        <Link
          to="accounts"
          className="flex h-16 flex-1 items-center justify-center px-4 text-indigo-9 hover:bg-indigo-2"
        >
          <CgProfile className="h-6 w-6" />
        </Link>
        <Link
          to="format"
          className="flex h-16 flex-1 items-center justify-center px-4 text-indigo-9 hover:bg-indigo-2"
        >
          <AiOutlineEdit className="h-6 w-6" />
        </Link>
      </nav>
    </div>
  );
};
