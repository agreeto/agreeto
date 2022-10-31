// note (richard): import order is important to not run into specificity issues
import "@fullcalendar/common/main.css"
import "@fullcalendar/timegrid/main.css"
import "../style.css"

import { useStorage } from "@plasmohq/storage/hook"

import { SignIn } from "~features/auth"
import { Calendar } from "~features/calendar"
import { Layout } from "~features/layout"
import { TRPCProvider } from "~features/trpc//api/provider"
import { ChromeStorage } from "~features/trpc/chrome/storage"

/**
 * The IndexPopup is the entry-file for the popup script of the extension.
 *
 * It provides the app w/ all global configurations via provicers, e.g.:
 * - trpc
 * - react-query
 *
 * *Before* rendering the providers with the App inside it, it checks authentication.
 * If the user is not authenticated, it will render only the SignIn page
 *
 * @returns `<SignIn />` Page OR `<App/>` wrapped in JSX Providers
 */
const _isDev = process.env.NODE_ENV === "development"
function IndexPopup() {
  const [accessTokenValue] = useStorage({
    key: "accessToken",
    isSecret: true
  })
  const accessToken = ChromeStorage.accessToken.safeParse(accessTokenValue)
  const isAuthenticated = !!accessToken.success
  return (
    <TRPCProvider>
      {/* maximum size of popup */}
      <div className="w-[800] h-[600]">
        {isAuthenticated ? (
          /**
           * THE ACTUAL APP
           */
          <Layout>
            <Calendar />
          </Layout>
        ) : (
          /**
           * OR: SIGN IN
           */
          <SignIn />
        )}
      </div>
    </TRPCProvider>
  )
}

export default IndexPopup
