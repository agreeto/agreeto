/* global Office */
import { useEffect, useCallback, FC } from "react";
import {
  queryClient,
  QUERY_KEY,
  useGetCurrentUser,
  useRegister,
} from "services";
import googleIcon from "./../../assets/google.svg";
import logoIcon from "./../../assets/icon512.png";
import microsoftIcon from "./../../assets/microsoft.svg";
import { AccountProvider } from "services/types";

const Taskpane: FC = () => {
  let dialog: Office.Dialog;

  const {
    error: unauthorized,
    isLoading: loadingUser,
    refetch: getCurrentUser,
  } = useGetCurrentUser();
  const { mutateAsync: register } = useRegister({
    onSuccess: ({ accessToken, refreshToken }) => {
      localStorage.setItem("ajwt", accessToken);
      localStorage.setItem("rjwt", refreshToken);
      getCurrentUser();
    },
  });

  const onStorageValueChange = useCallback(async (event: any) => {
    if (event.key === "ajwt") {
      if (event.newValue) {
        await register();
      } else {
        getCurrentUser();
      }
    } else if (event.key === "onLoginId") {
      queryClient.invalidateQueries([QUERY_KEY.GET_CURRENT_USER]);
      queryClient.invalidateQueries([QUERY_KEY.GET_EVENTS]);
      queryClient.invalidateQueries([QUERY_KEY.GET_ACCOUNTS]);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("storage", onStorageValueChange);
    return () => {
      window.removeEventListener("storage", onStorageValueChange);
    };
  }, []);

  const handleDialog = async (provider?: AccountProvider) => {
    Office.context.ui.displayDialogAsync(
      !unauthorized
        ? `${window.location.origin}/app`
        : `${window.location.origin}/auth-dialog?provider=${provider}`,
      {
        height: !unauthorized ? 85 : 70,
        width: !unauthorized ? 85 : 40,
        promptBeforeOpen: false,
      },
      async function (asyncResult) {
        dialog = asyncResult.value;
        dialog.addEventHandler(
          Office.EventType.DialogMessageReceived,
          processMessage
        );
      }
    );
  };

  const processMessage = (arg: any) => {
    var messageFromDialog = JSON.parse(arg.message);
    if (messageFromDialog.messageType === "dialogClosed") {
      dialog.close();
    }
  };

  const loginElem = (
    <div className="flex justify-center w-full pt-12">
      <div
        className="px-8 py-12 text-center rounded-xl"
        style={{ width: "450px" }}
      >
        <div className="text-3xl font-semibold">Welcome to AgreeTo</div>
        <div className="pt-8 text-sm">
          With AgreeTo you can share your availability with others in three
          clicks
        </div>
        <div className="pt-8 text-sm">
          <button
            className="h-12 button-outline"
            onClick={() => handleDialog(AccountProvider.GOOGLE)}
            style={{ width: "95%" }}
          >
            <div className="flex items-center justify-center">
              <img className="w-5 h-5 mr-2" src={googleIcon} />
              Sign in with Google
            </div>
          </button>
        </div>
        {/* Outlook login button */}
        <div className="pt-4 text-sm">
          <button
            className="h-12 button-outline"
            onClick={() => handleDialog(AccountProvider.MICROSOFT)}
            style={{ width: "95%" }}
          >
            <div className="flex items-center justify-center">
              <img className="w-5 h-5 mr-2" src={microsoftIcon} />
              Sign in with Microsoft
            </div>
          </button>
        </div>
        {/* Description */}
        <div className="pt-16 text-xs">
          By entering this website, I accept Privacy Policy and Terms and
          Conditions
        </div>
      </div>
    </div>
  );

  const authenticatedElem = (
    <div className="flex justify-center w-full pt-16">
      <div className="px-8 py-12 text-center" style={{ width: "450px" }}>
        <button
          className="h-12 button-outline"
          onClick={() => handleDialog()}
          style={{ width: "85%" }}
        >
          <div className="flex items-center justify-center">Open Calendar</div>
        </button>
      </div>
    </div>
  );
  // gracefully prevent error on Microsoft 365 version 16.0.11629 or later without Edge WebView2 (Chromium-based)
  // note (richard): as per review from MSFT - see: https://www.notion.so/agreeto/Get-Add-In-into-Office-Store-82c199388e294d358ece65f857b90741#73bd7bf09c9448338265f580501c1eb6
  if (navigator.userAgent.indexOf("Trident") !== -1) {
    return (
      <div>
        <div className="flex justify-center px-8 pt-8">
          This add-in won&apos;t run in your version of Office. Please upgrade
          either to perpetual Office 2021 or to a Microsoft 365 account.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-center px-8 pt-8">
        {/* Logo */}
        <div>
          <img className="w-24 h-24" src={logoIcon} />
        </div>
      </div>
      {/* Content */}
      {loadingUser ? null : unauthorized ? loginElem : authenticatedElem}
    </div>
  );
};

export default Taskpane;
