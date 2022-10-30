// FIXME: Why is Next lint rules slipping in here?

/* eslint-disable @next/next/no-img-element */
import * as Dialog from "@radix-ui/react-dialog"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client"
import tailwindCss from "data-text:~/src/style.css"
import type { PlasmoContentScript, PlasmoGetInlineAnchor } from "plasmo"
import { useState } from "react"
import { chromeLink } from "trpc-chrome/link"

import App from "~app"
import Layout from "~features/layout"
import { storage } from "~features/storage"
import type { StorageRouter } from "~storage-router"
import { ChromeStorage } from "~storage-schema"
import { trpc } from "~trpc"

export const config: PlasmoContentScript = {
  matches: ["https://mail.google.com/*"]
}

// these references are necessary to mount react's portal later
const PORTAL_ID = "agreeto-portal"
const SHADOW_HOST_ID = "agreeto-shadow-host"
// this mounts our component inline
export const getInlineAnchor: PlasmoGetInlineAnchor = () => {
  // we'll return this later to mount our react component next to it
  const gmailSendButton = document.querySelector<HTMLElement>(".btC > td")

  // note (richard): hi-jacking this fn to *also* inject our custom portal (via shadow host) on to the page
  if (!document.getElementById(SHADOW_HOST_ID)) {
    // 1. create a host for with a shadow root & inject into the body
    const shadowHost = document.createElement("div")
    shadowHost.id = SHADOW_HOST_ID
    const shadowRoot = shadowHost.attachShadow({ mode: "open" })
    document.body.insertAdjacentElement("beforebegin", shadowHost) // inject the shadowHost into the body

    // 2. add tailwind to shadow dom
    const styleTailwind = document.createElement("style")
    styleTailwind.textContent = tailwindCss
    shadowRoot.appendChild(styleTailwind)

    // 3. place dialog portal next to the body tag (once)
    const customPortal = document.createElement("div")
    customPortal.id = PORTAL_ID
    customPortal.style.cssText = "overflow: auto;"

    shadowRoot.appendChild(customPortal)
  }
  // after hi-jack, return the anchor
  return gmailSendButton
}

// this makes plasmo inject our style w/ tw into the shadow dom
// note (richard): necessary to be able to use tw on the below react component
export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = tailwindCss
  return style
}
const port = chrome.runtime.connect(chrome.runtime.id)

export const chromeClient = createTRPCProxyClient<StorageRouter>({
  links: [/* 👉 */ chromeLink({ port })]
})

// The icon button that we inject next to our anchor (send btn)
const Gmail = () => {
  const [open, setOpen] = useState(false) // to pass to radix
  const portalContainer = document // our injected portal (next to body)
    .getElementById(SHADOW_HOST_ID)
    ?.shadowRoot?.getElementById(PORTAL_ID)

  // note (richard): no idea why this is necessary, but encountering this error:
  // https://github.com/theKashey/react-remove-scroll-bar/blob/3dd80e28c92b8aac025e41f4258ff926cdc88af9/src/utils.ts#L22

  if (process.env.NODE_ENV !== "production")
    document.body.style.cssText = "overflow-y: auto!important;"

  // Configure tRPC
  const [queryClient] = useState(() => new QueryClient())
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${process.env.PLASMO_PUBLIC_WEB_URL}/api/trpc`,
          async headers() {
            const accessTokenValue = await storage.get("accessToken")
            const authentication =
              ChromeStorage.accessToken.safeParse(accessTokenValue)

            return authentication.success
              ? {
                  authorization: `Bearer ${authentication.data}`
                }
              : {}
          }
        })
      ]
    })
  )

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <div className="pl-1">
          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger className="bg-white rounded px-1.5 py-1.5  hover:bg-gray-50 focus:outline-none ">
              <img
                className="w-6"
                src="https://www.agreeto.app/%2Flogo.png"
                alt="AgreeTo Logo"
              />
            </Dialog.Trigger>
            <Dialog.Portal container={portalContainer}>
              <Dialog.Overlay className="fixed w-screen h-screen bg-black bg-opacity-50 pointer-events-auto z-[2147483646]">
                <Dialog.Content
                  id="agreeto-app"
                  className="fixed -translate-x-1/2 -translate-y-1/2 bg-white shadow-sm top-1/2 left-1/2 shadow-transparent l-1/2 z-[2147483646] w-[800] h-[600]">
                  <Layout>
                    <App />
                  </Layout>
                </Dialog.Content>
              </Dialog.Overlay>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </QueryClientProvider>
    </trpc.Provider>
  )
}

export default Gmail
