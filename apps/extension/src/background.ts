import { storage } from "~features/storage"
import { ChromeStorage } from "~storage-schema"
// @ts-expect-error: FIXME queryClient isn't export from trpc file
import { queryClient } from "~trpc"

// FIXME: eslint complains about no-undef -- requires global declaration at top of file maybe? (richard)
// eslint-disable-next-line
chrome.runtime.onMessageExternal.addListener(
  async (request, sender, sendResponse) => {
    console.log("INCOMING MESSAGE...", { sender }, { request })
    console.assert(Boolean(sender.url))
    if (!sender.url) return
    // const senderUrl = new URL(sender.url)

    // check that the sender's origin is our web app
    // TODO: make this typesafe with some such as
    console.assert(
      // FIXME: include env var dep in turbo.json
      // eslint-disable-next-line
      sender.url.includes(process.env.PLASMO_PUBLIC_WEB_URL!),
      `sender url not whitelisted | provided: ${
        sender.url
        // FIXME: include env var dep in turbo.json
        // eslint-disable-next-line
      } | checked against: ${process.env.PLASMO_PUBLIC_WEB_URL!}`
    )
    // FIXME: include env var dep in turbo.json
    // eslint-disable-next-line
    if (!sender.url.includes(process.env.PLASMO_PUBLIC_WEB_URL!)) return // don't allow this web page access

    // check if the request contains our expected property
    // REVIEW: Should this be some random encrypted key for added security?
    console.assert(Boolean(request.accessToken))
    if (request?.accessToken) {
      // get out storage value
      const storageValue = await storage.get<unknown>("accessToken")
      // validate it according to our schema
      const accessToken = ChromeStorage.accessToken.safeParse(storageValue)
      // skip storage mutation if we already have that token
      if (accessToken.success && accessToken.data === request.accessToken) {
        console.log("RESPONDING: ", { success: true })
        sendResponse({ success: true })
        return
      }

      // update chrome storage w/ token
      await storage.set("accessToken", request.accessToken)

      const updatedAccessToken = await storage.get<unknown>("accessToken")
      console.log("RESPONDING: ", {
        success: updatedAccessToken === request.accessToken
      })
      sendResponse({
        success: updatedAccessToken === request.accessToken
      })
    } else if (request === "signout") {
      // reset chrome storage
      await storage.set("accessToken", null)
      console.log("RESPONDING: ", {
        success: (await storage.get<unknown>("accessToken")) === null
      })
      // respond with success message
      sendResponse({
        success: (await storage.get<unknown>("accessToken")) === null
      })
    }
    return
  }
)
// FIXME: eslint complains about no-undef -- requires global declaration at top of file maybe? (richard)
// eslint-disable-next-line
chrome.storage.onChanged.addListener((changes) => {
  if (changes.accessToken) {
    // FIXME: Why am I using queryClient -- isn't useContext the correct way to invalidate?
    queryClient.invalidateQueries([changes.accessToken])
    // TODO: Do I need to rerender the popup.tsx?
  }
})

export {}
