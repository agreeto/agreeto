import { storage } from "~features/trpc/chrome/storage";

const WEB_URL = process.env.PLASMO_PUBLIC_WEB_URL as string;

// TODO: Implement trpc-chrome

chrome.runtime.onMessageExternal.addListener(
  async (request, sender, sendResponse) => {
    console.log("[Plasmo Background Script]: Incoming request: ", {
      sender,
      request,
    });

    // check that the sender's origin is our web app
    console.assert(
      sender.url?.includes(WEB_URL),
      `sender url not whitelisted | provided: ${sender.url} | checked against: ${WEB_URL}}`,
    );
    if (!sender.url?.includes(WEB_URL)) return; // don't allow this web page access

    switch (request.action) {
      case "signin": {
        const token = request.accessToken as string;
        // get out storage value, and see if it's the same as incoming
        const storageValue = await storage.get<unknown>("accessToken");
        if (typeof storageValue === "string" && storageValue === token) {
          sendResponse({ success: true });
          return;
        }

        // update chrome storage w/ token, and check if it worked
        await storage.set("accessToken", request.accessToken);
        const updatedAccessToken = await storage.get<unknown>("accessToken");
        const success = updatedAccessToken === token;

        // send response
        sendResponse({ success });
        break;
      }
      case "signout": {
        // reset chrome storage
        await storage.set("accessToken", null);
        const updated = await storage.get("accessToken");
        console.log("RESPONDING: ", {
          success: updated === null,
        });
        // respond with success message
        sendResponse({
          success: updated === null,
        });
        break;
      }
      default:
        console.error("[Plasmo Background Script]: Unknown action received");
    }
  },
);
