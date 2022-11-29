import { Navbar } from "~app/navbar";

export const Layout: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="flex w-full h-full">
      <aside className="w-1/12">
        <Navbar />
      </aside>
      {/* - 👇 inject the `children` here 👇 */}
      <main className="flex justify-center flex-1 w-11/12 overflow-y-hidden">
        {children}
      </main>
    </div>
  );
};
