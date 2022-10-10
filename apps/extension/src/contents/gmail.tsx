import * as Dialog from "@radix-ui/react-dialog"
import tailwindCss from "data-text:~/src/style.css"
import type { PlasmoContentScript, PlasmoGetInlineAnchor } from "plasmo"
import { useState } from "react"

import { Calendar } from "~features/calendar"

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

// The icon button that we inject next to our anchor (send btn)
const Gmail = () => {
  const [open, setOpen] = useState(false) // to pass to radix
  const portalContainer = document // our injected portal (next to body)
    .getElementById(SHADOW_HOST_ID)
    ?.shadowRoot?.getElementById(PORTAL_ID)

  return (
    <div className="pl-1">
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger className="bg-white rounded px-1.5 py-1.5  hover:bg-gray-50 focus:outline-none ">
          <img className="w-6" src="https://www.agreeto.app/%2Flogo.png" />
        </Dialog.Trigger>
        <Dialog.Portal container={portalContainer}>
          <Dialog.Overlay asChild>
            <div
              id="agreeto-overlay"
              className="fixed w-screen h-screen bg-black bg-opacity-50 pointer-events-auto z-[2147483646]"
            />
          </Dialog.Overlay>
          <Dialog.Content className="fixed -translate-x-1/2 -translate-y-1/2 bg-white shadow-sm top-1/2 left-1/2 shadow-transparent l-1/2 z-[2147483646] w-[800] h-[600]">
            <Calendar />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}

export default Gmail
