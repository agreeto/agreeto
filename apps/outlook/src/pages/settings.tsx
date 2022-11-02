import React from "react";
import { trpc } from "../features/trpc/hooks";

export const Settings: React.FC = () => {
  const { data: user } = trpc.user.byId.useQuery({
    id: "cl9y4zuvc00007up6la371hyg",
  });

  return (
    <div>
      <h1>Hello {user?.name}!</h1>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
};
