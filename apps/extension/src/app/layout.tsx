import { useEffect } from "react";

import { Navbar } from "~app/navbar";
import { trpcApi } from "~features/trpc/api/hooks";

export const Layout: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  // Check that trial/subscription are valid

  const utils = trpcApi.useContext();
  useEffect(() => {
    // prefetch subscription
    utils.user.subscription.prefetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
