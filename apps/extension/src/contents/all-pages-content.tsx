// import calendarCssText from "data-text:~/../../packages/calendar/dist/assets/index.css";
// import cssText from "data-text:~/contents/all-pages-content-styles.css";
import { Outlet } from "@tanstack/react-location";
import type { PlasmoContentScript } from "plasmo";
import React from "react";

import { Layout } from "~app/layout";
import { useIsAuthed } from "~features/auth/is-authed";
import { SignIn } from "~features/auth/sign-in";
import { TRPCProvider } from "~features/trpc/api/provider";

export const config: PlasmoContentScript = {
  matches: ["http://*/*", "https://*/*"],
  // css: ["font.css"],
};

// ----- Customise our modal injection to hide initially

// We use the getRootContainer to inject the shadow host but hide it initially
// export const getRootContainer = async () => {
//   // 1. create a host for with a shadow root
//   const shadowHost = document.createElement("div");
//   shadowHost.id = SHADOW_HOST_ID;
//   // note (richard):  hiding initially to enable toggle onMessage
//   shadowHost.style.cssText = `
//   display: none;
//   `;
//   const shadowRoot = shadowHost.attachShadow({ mode: "open" });
//   // inject the shadowHost w/ shadowRoot into the body
//   document.body.insertAdjacentElement("beforebegin", shadowHost);

//   // 2. add our custom style element for the shadow dom
//   shadowRoot.appendChild(getStyleShadowDOM());
//   // Calendar css
//   shadowRoot.appendChild(getStyleCalendar());

//   // 4. create and insert backdrop
//   const backdrop = document.createElement("div");
//   backdrop.id = PLASMO_CONTAINER_BACKDROP_ID;
//   backdrop.onclick = () => {
//     toggleAppVisibility();
//   };
//   shadowRoot.appendChild(backdrop);

//   // 3. create and insert container for our application mount
//   const container = document.createElement("div");
//   container.id = PLASMO_CONTAINER_ID;
//   shadowRoot.appendChild(container);

//   return container;
// };

// const getStyleShadowDOM = () => {
//   const style = document.createElement("style");
//   style.id = SHADOW_STYLE_ID;
//   style.textContent = cssText;
//   return style;
// };

// const getStyleCalendar = () => {
//   const style = document.createElement("style");
//   style.textContent = calendarCssText;
//   return style;
// };

const App: React.FC = () => {
  const [_renderKey, _setRenderKey] = React.useState(0);

  const { isAuthed, isAuthenticating } = useIsAuthed();

  //   const {
  //     data: user,
  //     error: authError,
  //     isLoading: isLoadingUser,
  //   } = trpcApi.user.me.useQuery();

  return (
    <div style={{ width: "100%", borderRadius: "10px" }}>
      {isAuthenticating ? (
        <div className="h-full w-full grid place-content-center">
          <div className="h-12 w-12 rounded-full border-2 animate-pulse"></div>
        </div>
      ) : isAuthed ? (
        /** THE ACTUAL APP */
        <Layout>
          <Outlet />
        </Layout>
      ) : (
        /** OR: SIGN IN */
        <SignIn />
      )}
    </div>
  );
};

/** Content needs access to the tRPC context, so we need a wrapper */
const IndexPopup: React.FC = () => {
  return (
    <TRPCProvider>
      <App />
    </TRPCProvider>
  );
};

export default IndexPopup;
