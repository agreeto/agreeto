import { createTRPCProxyClient } from "@trpc/client";
import { chromeLink } from "trpc-chrome/link";

import type { ChromeRouter } from "./router";

const port = chrome.runtime.connect(chrome.runtime.id);

export const trpcChromeClient = createTRPCProxyClient<ChromeRouter>({
  links: [chromeLink({ port })],
});
