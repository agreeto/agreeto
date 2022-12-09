import Calendar from "@agreeto/calendar-react";
import * as Dialog from "@radix-ui/react-dialog";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import tailwindCss from "data-text:~/src/style.css";
import type { PlasmoContentScript, PlasmoGetInlineAnchor } from "plasmo";
import { useState } from "react";
import { z } from "zod";

import { useStorage } from "@plasmohq/storage/hook";

import { Layout } from "~app/layout";
import { SignIn } from "~features/auth/sign-in";
import { trpcApi } from "~features/trpc/api/hooks";

// SCHEMAS
export const Session = z.object({
  expires: z.string(),
  user: z.object({
    id: z.string().optional().nullable(),
    name: z.string().optional().nullable(),
    email: z.string().email().optional().nullable(),
    image: z.string().url().optional().nullable(),
  }),
});
export const AccessToken = z.string();

const ChromeStorageSchema = z.object({
  accessToken: AccessToken.optional(),
  session: Session.optional(),
});

export const config: PlasmoContentScript = {
  matches: ["https://mail.google.com/*"],
};

// these references are necessary to mount react's portal later
const PORTAL_ID = "agreeto-portal";
const SHADOW_HOST_ID = "agreeto-shadow-host";
// this mounts our component inline
export const getInlineAnchor: PlasmoGetInlineAnchor = () => {
  // we'll return this later to mount our react component next to it
  const gmailSendButton = document.querySelector<HTMLElement>(".btC > td");

  // note (richard): hi-jacking this fn to *also* inject our custom portal (via shadow host) on to the page
  if (!document.getElementById(SHADOW_HOST_ID)) {
    // 1. create a host for with a shadow root & inject into the body
    const shadowHost = document.createElement("div");
    shadowHost.id = SHADOW_HOST_ID;
    const shadowRoot = shadowHost.attachShadow({ mode: "open" });
    document.body.insertAdjacentElement("beforebegin", shadowHost); // inject the shadowHost into the body

    // 2. add tailwind to shadow dom
    const styleTailwind = document.createElement("style");
    styleTailwind.textContent = tailwindCss;
    shadowRoot.appendChild(styleTailwind);

    // 3. place dialog portal next to the body tag (once)
    const customPortal = document.createElement("div");
    customPortal.id = PORTAL_ID;
    customPortal.style.cssText = "overflow: auto;";

    shadowRoot.appendChild(customPortal);
  }
  // after hi-jack, return the anchor
  return gmailSendButton;
};

// this makes plasmo inject our style w/ tw into the shadow dom
// note (richard): necessary to be able to use tw on the below react component
export const getStyle = () => {
  const style = document.createElement("style");
  style.textContent = tailwindCss;
  return style;
};

// The icon button that we inject next to our anchor (send btn)
const Gmail = () => {
  const [open, setOpen] = useState(false); // to pass to radix
  const portalContainer = document // our injected portal (next to body)
    .getElementById(SHADOW_HOST_ID)
    ?.shadowRoot?.getElementById(PORTAL_ID);

  // note (richard): no idea why this is necessary, but encountering this error:
  // https://github.com/theKashey/react-remove-scroll-bar/blob/3dd80e28c92b8aac025e41f4258ff926cdc88af9/src/utils.ts#L22
  if (process.env.NODE_ENV !== "production")
    document.body.style.cssText = "overflow-y: auto!important;";

  return (
    <div className="pl-1">
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger className="bg-white rounded px-1.5 py-1.5  hover:bg-gray-50 focus:outline-none ">
          <img className="w-6" src="https://www.agreeto.app/%2Flogo.png" />
        </Dialog.Trigger>
        <Dialog.Portal container={portalContainer}>
          <Dialog.Overlay>
            {/* <div
              id="agreeto-overlay"
              className="fixed w-screen h-screen bg-black bg-opacity-50 pointer-events-auto z-[2147483646]"
            /> */}
            <Dialog.Content className="fixed -translate-x-1/2 -translate-y-1/2 bg-white shadow-sm top-1/2 left-1/2 shadow-transparent l-1/2 z-[2147483646] w-[800] h-[600]">
              <App />
            </Dialog.Content>
          </Dialog.Overlay>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};

export default Gmail;

const App = () => {
  // Authentication
  const [accessTokenValue] = useStorage({
    key: "accessToken",
    isSecret: true,
  });
  const accessToken =
    ChromeStorageSchema.shape.accessToken.parse(accessTokenValue);
  const isAuthenticated = Boolean(accessToken);

  // Configure tRPC
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpcApi.createClient({
      links: [
        httpBatchLink({
          url: `${process.env.PLASMO_PUBLIC_WEB_URL}/api/trpc`,
          headers() {
            return isAuthenticated
              ? {
                  authorization: `Bearer ${accessToken}`,
                }
              : {};
          },
        }),
      ],
    }),
  );

  // Providers
  return (
    <trpcApi.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {/* maximum size of popup */}
        <div className="w-[800] h-[600]">
          {isAuthenticated ? (
            /**
             * THE ACTUAL APP
             */
            <Layout>
              <Calendar onPageChange={(to) => (window.location.href = to)} />
            </Layout>
          ) : (
            /**
             * OR: SIGN IN
             */
            <SignIn />
          )}
        </div>
      </QueryClientProvider>
    </trpcApi.Provider>
  );
};
