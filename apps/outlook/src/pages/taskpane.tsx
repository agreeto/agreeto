import React from "react";
import { trpc } from "../features/trpc/hooks";

export const Taskpane: React.FC = () => {
  const { data: me } = trpc.user.myAccounts.useQuery();

  return (
    <div className="grid min-h-screen w-full place-content-center space-y-4">
      <pre className="overflow-x-scroll">{JSON.stringify(me, null, 2)}</pre>
    </div>
  );
};
