import { trpcApi } from "~features/trpc/api/hooks"

export const Settings = () => {
  const userQuery = trpcApi.account.me.useQuery()

  console.log(userQuery.data)
  return (
    <div>
      <h2 className="text-xl font-bold">Settings</h2>
      <pre>{JSON.stringify(userQuery.data, null, 2)}</pre>
    </div>
  )
}
