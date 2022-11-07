import { type FC } from "react";
import { trpc } from "../features/trpc/hooks";

export const Home: FC = () => {
  const { data: user } = trpc.user.myAccounts.useQuery();
  return (
    <div>
      <h1>Welcome {user?.name}!</h1>
      <details>
        <summary>Raw data</summary>

        <pre className="overflow-x-scroll">{JSON.stringify(user, null, 2)}</pre>
      </details>
    </div>
  );
};
