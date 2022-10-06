import { z } from "zod"

import { storage } from "~features/storage"
import { queryClient } from "~react-query"
import { ChromeStorage } from "~storage-schema"

chrome.runtime.onMessageExternal.addListener(
  async (request, sender, sendResponse) => {
    console.log("INCOMING MESSAGE...", { sender }, { request })
    console.assert(Boolean(sender.url))
    if (!sender.url) return
    const senderUrl = new URL(sender.url)

    // check that the sender's origin is our web app
    // TODO: make this typesafe with some such as
    console.assert(
      sender.url.includes(process.env.PLASMO_PUBLIC_WEB_URL!),
      `sender url not whitelisted | provided: ${
        sender.url
      } | checked against: ${process.env.PLASMO_PUBLIC_WEB_URL!}`
    )
    if (!sender.url.includes(process.env.PLASMO_PUBLIC_WEB_URL!)) return // don't allow this web page access

    // check if the request contains our expected property
    // REVIEW: Should this be some random encrypted key for added security?
    console.assert(Boolean(request.accessToken))
    if (!request?.accessToken) {
      return
    }

    // get out storage value
    const storageValue = await storage.get<unknown>("accessToken")
    // validate it according to out schema
    const accessToken = ChromeStorage.accessToken.parse(storageValue)
    // skip storage mutation if we already have that token
    if (accessToken === request.accessToken) {
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
    return
  }
)

chrome.storage.onChanged.addListener((changes) => {
  if (changes.accessToken) {
    // invalidate rq cache
    queryClient.invalidateQueries([changes.accessToken])
    // TODO: Do I need to rerender the popup.tsx?
  }
})

export {}
