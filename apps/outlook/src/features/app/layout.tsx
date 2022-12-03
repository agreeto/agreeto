import { Navbar } from "./navbar";

export const Layout: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="flex h-full w-full">
      <aside className="w-3/12">
        <Navbar />
      </aside>
      {/* - 👇 inject the `children` here 👇 */}
      <main className="flex w-9/12 flex-1 justify-center overflow-y-hidden">
        {children}
      </main>
    </div>
  );
};
