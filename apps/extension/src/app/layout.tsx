import { Navbar } from "~app/navbar";

export const Layout: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="flex h-full w-full">
      <aside className="w-16">
        <Navbar />
      </aside>
      {/* - 👇 inject the `children` here 👇 */}
      <main className="flex flex-1">{children}</main>
    </div>
  );
};
