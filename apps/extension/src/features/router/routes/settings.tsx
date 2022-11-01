import { trpcApi } from "~features/trpc/api"

export const Settings = () => {
  const userQuery = trpcApi.user.myAccounts.useQuery()

  console.log(userQuery.data)
  return (
    <div>
      <h2 className="text-xl font-bold">Settings</h2>
      <pre>{JSON.stringify(userQuery.data, null, 2)}</pre>
    </div>
  )
}
