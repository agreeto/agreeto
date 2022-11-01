// FIXME: Why is Next lint rules slipping in here?

/* eslint-disable @next/next/no-img-element */
import { CalendarDaysIcon, Cog8ToothIcon } from "@heroicons/react/20/solid"
import { Link } from "@tanstack/react-location"

export const Navbar = () => {
  return (
    <div className="flex flex-col flex-shrink pt-5 pb-4 overflow-y-auto bg-white border-r border-gray-200 divide-y">
      <div className="flex items-center flex-shrink-0 px-4 space-y-5">
        <img
          className="w-auto h-8"
          src="https://tailwindui.com/img/logos/mark.svg?color=blue&shade=600"
          alt="Your Company"
        />
      </div>
      <div className="flex flex-col flex-grow mt-5">
        <nav
          className="flex flex-col flex-1 gap-2 bg-white items-center"
          aria-label="Sidebar">
          <Link to="calendar">
            <CalendarDaysIcon className="h-10 w-10 p-1 text-indigo-600 hover:text-indigo-700" />
          </Link>
          <Link to="settings">
            <Cog8ToothIcon className="h-10 w-10 p-1 text-indigo-600 hover:text-indigo-700" />
          </Link>
          {/* {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={classNames(
                item.current
                  ? "bg-blue-50 border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                "group flex items-center px-3 py-2 text-sm font-medium border-l-4 grow-0 shrink-0"
              )}>
              <item.icon
                className={classNames(
                  item.current
                    ? "text-blue-500"
                    : "text-gray-400 group-hover:text-gray-500",
                  "mr-3 flex-shrink-0 h-6 w-6"
                )}
                aria-hidden="true"
              />
            </a>
          ))} */}
        </nav>
      </div>
    </div>
  )
}
