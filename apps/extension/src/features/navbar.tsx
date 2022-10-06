import { CalendarIcon, Cog6ToothIcon } from "@heroicons/react/24/outline"

const navigation = [
  { name: "Calendar", icon: CalendarIcon, href: "#", current: true },
  { name: "Settings", icon: Cog6ToothIcon, href: "#", current: false }
]
const classNames = (...classes: string[]) => {
  return classes.filter(Boolean).join(" ")
}
export const Navbar = () => {
  return (
    <div className="flex flex-shrink flex-col overflow-y-auto border-r border-gray-200 bg-white pt-5 pb-4  divide-y">
      <div className="flex flex-shrink-0 items-center space-y-5 px-4">
        <img
          className="h-8 w-auto"
          src="https://tailwindui.com/img/logos/mark.svg?color=blue&shade=600"
          alt="Your Company"
        />
      </div>
      <div className="mt-5 flex flex-grow flex-col">
        <nav
          className="flex-1 space-y-1 bg-white flex flex-col justify-evenly"
          aria-label="Sidebar">
          {navigation.map((item) => (
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
          ))}
        </nav>
      </div>
    </div>
  )
}
