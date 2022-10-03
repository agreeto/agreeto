import type { PlasmoContentScript } from "plasmo"

export const config: PlasmoContentScript = {
  matches: ["http://*/*", "https://*/*"]
}

window.addEventListener("load", () => {
  console.log("content script loaded")

  document.body.style.background = "cream"
})
