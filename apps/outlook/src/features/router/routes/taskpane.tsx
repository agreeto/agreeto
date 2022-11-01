import { type FC } from "react";
import { trpc } from "../../trpc/hooks";

export const Taskpane: FC = () => {
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
