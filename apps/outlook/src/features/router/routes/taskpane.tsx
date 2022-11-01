import React from "react";
import { trpc } from "../../trpc/hooks";

export const Taskpane: React.FC = () => {
  const { data: user } = trpc.user.byId.useQuery({
    id: "cl9y4zuvc00007up6la371hyg",
  });

  const handleDialog = () => {
    Office.context.ui.displayDialogAsync(
      // `${import.meta.env.VITE_API_URL}/api/auth/signin?redirectUrl=${
      //   import.meta.env.VITE_API_URL
      // }/auth/outlook`,
      "https://localhost:3000",
      { height: 50, width: 50 },
      (result) => {
        console.log(result);
      }
    );
  };

  return (
    <div>
      <h1>Hello {user?.name}!</h1>
      <pre>{JSON.stringify(user, null, 2)}</pre>
      <button onClick={handleDialog}>Open Dialog</button>
    </div>
  );
};
