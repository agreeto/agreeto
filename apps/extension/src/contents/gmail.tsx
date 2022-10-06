// document.getElementById(":mb")
// document.querySelector("h2 > div.aYF > span")
import * as Dialog from "@radix-ui/react-dialog"
import cssText from "data-text:~/src/style.css"
import type {
  PlasmoContentScript,
  PlasmoGetInlineAnchor,
  PlasmoGetRootContainer,
  PlasmoRender
} from "plasmo"
import { useState } from "react"
import ReactDOM from "react-dom/client"

import { Calendar } from "~features/calendar"

export const config: PlasmoContentScript = {
  matches: ["https://mail.google.com/*"]
}

// this inserts plasmo's shadow root w/ `Gmail` next to the specified element
const CONTAINER_ID = "agreeto-item"
const PORTAL_ID = "agreeto-portal"

export const getInlineAnchor: PlasmoGetInlineAnchor = () => {
  // 1.  place our portal next to the body tag (once)
  if (!document.getElementById(PORTAL_ID)) {
    const customDiv = document.createElement("div")
    customDiv.id = PORTAL_ID
    document.body.parentNode?.insertBefore(customDiv, document.body.nextSibling)
  }
  return document.querySelector(".btC > td") // the send split-button
}

// this makes tailwind available inside the shadowRoot
export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

// this component is mounted by plasmo in its shadowDOM
const Gmail = () => {
  const [open, setOpen] = useState(false)
  const portalContainer = document.getElementById(PORTAL_ID)
  return (
    <div className="pl-1">
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger className="bg-white rounded px-1.5 py-1.5  hover:bg-gray-50 focus:outline-none ">
          <img className="w-6" src="https://www.agreeto.app/%2Flogo.png" />
        </Dialog.Trigger>
        <Dialog.Portal container={portalContainer}>
          <Dialog.Overlay />
          <Dialog.Content>
            <Calendar />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}

/**
 * A helper function that awaits an HTML element to be inserted into the DOM
 *
 * Note (richard):
 * API Inspired by https://stackoverflow.com/a/61511955/5608461
 * Performance notes (inspired by https://stackoverflow.com/a/38882022/5608461):
 * - on success, disconnect the observer & attach a new one (ideally, provide a `parent` param to attach it non-recursively by setting subtree: false)
 * - if you can't use getElementById, prefer getElementsByTagName and getElementsByClassName and _avoid_ querySelector and especially the extremely slow querySelectorAll
 * - If querySelectorAll is absolutely unavoidable inside MutationObserver callback, first perform the querySelector check, on the average such combo will be much faster.
 * - avoid for loops (or array methods) inside the MutationObserver callback
 */
type WaitForElementProps =
  | { id: string; parent?: HTMLElement }
  | { className: string; parent?: HTMLElement }
const waitForElement = (props: WaitForElementProps) => {
  const targetIsId = "id" in props
  const target = targetIsId ? props.id : props.className

  return new Promise<HTMLElement>((resolve) => {
    // if element already present, return
    const earlyElement = targetIsId
      ? document.getElementById(target)
      : (document.getElementsByClassName(target)[0] as HTMLElement)
    if (earlyElement) {
      return resolve(earlyElement)
    }

    // else observe dom mutations for our element
    const observer = new MutationObserver((mutations) => {
      // was the element added to the entire document?
      const addedElement = targetIsId
        ? document.getElementById(target)
        : (document.getElementsByClassName(target)[0] as HTMLElement)
      if (addedElement) {
        resolve(addedElement)
        // always disconnect observer on success
        observer.disconnect()
      }
    })

    // attach a new non-recursive observer on a provided element (or document.body if none provided)
    observer.observe(props.parent || document.body, {
      childList: true,
      // note (richard): Whenever possible observe direct parents non-recursively (subtree: false).
      subtree: !Boolean(props.parent)
    })
  })
}

export default Gmail
