import { CalendarDaysIcon } from "@heroicons/react/20/solid";
import { Link } from "@tanstack/react-location";
import { useState } from "react";
import { AiOutlineEdit } from "react-icons/ai";
import { BsCalendarPlus, BsGear } from "react-icons/bs";
import { CgProfile } from "react-icons/cg";
import {
  MdOutlineManageAccounts,
  MdOutlinePermContactCalendar,
} from "react-icons/md";

const options = ["cal-plus", "cal-profile", "profile-gear", "profile"] as const;
export const Navbar = () => {
  const [selectedIcon, setSelectedIcon] =
    useState<typeof options[number]>("profile");
  return (
    <div className="flex flex-col flex-1 h-full pb-4 overflow-y-auto bg-white border-r border-gray-200">
      <div className="p-4 border-b">
        <img
          className="w-8 h-8"
          src="https://localhost:3000/icon512.png"
          alt="AgreeTo"
        />
      </div>
      {/* TEMPORARY START */}
      {/* REVIEW: a select element to showcase different icons for some ui feedback */}
      {/* TODO: Remove after I got feedback from peers: https://agreeto.slack.com/archives/C03160KK0KC/p1669107888424029 */}
      <label htmlFor="icon-select">Choose a pet:</label>

      <select
        name="pets"
        id="icon-select"
        onChange={(e) =>
          setSelectedIcon(e.target.value as typeof options[number])
        }
      >
        <option value="">--Please choose an option--</option>
        <option value="cal-plus">with Calendar & Plus</option>
        <option value="cal-profile">with Calendar & Profile</option>
        <option value="profile-gear">with Profile & Gear </option>
        <option value="profile">Current (Profile only)</option>
      </select>
      {/* TEMPORARY END */}

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
          {/* REVIEW: Which icon do we prefer? TODO: Remove deselected elements after agreement */}
          {selectedIcon === "cal-profile" ? (
            <MdOutlinePermContactCalendar className="w-6 h-6" />
          ) : selectedIcon === "profile-gear" ? (
            <MdOutlineManageAccounts className="w-6 h-6" />
          ) : selectedIcon === "cal-plus" ? (
            <BsCalendarPlus className="w-6 h-6" />
          ) : (
            <CgProfile className="w-6 h-6" />
          )}
        </Link>
        <Link
          to="format"
          className="flex items-center justify-center flex-1 h-16 px-4 text-indigo-9 hover:bg-indigo-2"
        >
          <AiOutlineEdit className="w-6 h-6" />
        </Link>
      </nav>
    </div>
  );
};
// <nav
//   className="flex flex-col items-center flex-1 gap-2 bg-white"
//
// >
//   <Link to="calendar">
//     <CalendarDaysIcon className="w-10 h-10 p-1 text-indigo-9 hover:text-indigo-9" />
//   </Link>
//   <Link to="settings">
//     <Cog8ToothIcon className="w-10 h-10 p-1 text-indigo-9 hover:text-indigo-9" />
//   </Link>
//   <Link to="accounts">
//     <MdOutlinePermContactCalendar className="w-10 h-10 p-1 text-indigo-9 hover:text-indigo-9" />
//   </Link>
// </nav>
