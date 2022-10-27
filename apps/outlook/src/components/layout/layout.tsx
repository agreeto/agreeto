import Calendar from "calendar";
import { FC, useState } from "react";

import logoIcon from "../../assets/icon512.png";
import { AccountIcon, CalendarIcon, SettingsIcon } from "../../assets/icons";
import Account from "../../pages/account";
import Settings from "../../pages/settings";
import PageWrapper from "../page-wrapper";

type Page = "calendar" | "account" | "format" | "settings";

type Props = {
  renderKey?: number;
};

const Layout: FC<Props> = () => {
  const [page, setPage] = useState<Page>("calendar");

  const navbarItems = (
    <>
      {/* Calendar */}
      <div
        className="flex justify-center mt-32 cursor-pointer"
        onClick={() => setPage("calendar")}
        style={{
          borderRight: page === "calendar" ? "1px solid #0165FF" : "unset",
        }}
      >
        {CalendarIcon(page === "calendar" ? "#0165FF" : "#C2C7CD")}
      </div>
      {/* Account */}
      <div
        className="flex justify-center mt-20 cursor-pointer"
        onClick={() => setPage("account")}
        style={{
          borderRight: page === "account" ? "1px solid #0165FF" : "unset",
        }}
      >
        <div className="w-7 h-7">
          {AccountIcon(page === "account" ? "#0165FF" : "#C2C7CD")}
        </div>
      </div>
      {/* Format */}
      {/* TODO: Uncomment to see format page */}
      {/* <div
        className="flex justify-center mt-20 cursor-pointer"
        onClick={() => setPage("format")}
        style={{
          borderRight: page === "format" ? "1px solid #0165FF" : "unset"
        }}>
        {CustomizationIcon(page === "format" ? "#0165FF" : "#C2C7CD")}
      </div> */}
      {/* Settings */}
      <div
        className="flex justify-center mt-20 cursor-pointer"
        onClick={() => setPage("settings")}
        style={{
          borderRight: page === "settings" ? "1px solid #0165FF" : "unset",
        }}
      >
        {SettingsIcon(page === "settings" ? "#0165FF" : "#C2C7CD")}
      </div>
    </>
  );

  // radix dialog state
  const [container, setContainer] = useState(null); // needed for custom portal
  const [isOpenDialog, setIsOpenDialog] = useState(false); // needed to conditionally hide custom portal

  return (
    <div className="flex h-full">
      {/* Navbar */}
      <div
        className="pt-8 text-center border-r-2 border-gray-50"
        style={{ width: "70px" }}
      >
        {/* Logo */}
        <div>
          <img className="m-auto w-9 h-9" src={logoIcon} />
        </div>

        {/* Navbar buttons */}
        {navbarItems}
      </div>

      {/* Content */}
      <div style={{ width: "calc(100% - 70px)" }}>
        {page === "calendar" ? (
          <Calendar renderKey={1} />
        ) : page === "account" ? (
          // Account page w/ custom radix portal (to load dialog)
          <>
            {/* TODO (richard): Inject radix portal below the `APP_CONTENT_ID` element and have it's content be rendered by children */}
            {/* radix portal */}
            <div
              ref={setContainer as any}
              className={`absolute h-full w-[inherit] ${
                // hide this portal conditionally when the dialog's closed
                isOpenDialog ? "" : "hidden"
              }`}
            ></div>
            {/* Account page */}
            <PageWrapper
              title="Account"
              content={
                <Account
                  container={container}
                  onOpen={setIsOpenDialog}
                  isOpenDialog={isOpenDialog}
                />
              }
            />
          </>
        ) : page === "format" ? (
          <PageWrapper title="Formatting" content="Format Content" />
        ) : page === "settings" ? (
          <PageWrapper title="Settings" content={<Settings />} />
        ) : null}
      </div>
    </div>
  );
};

export default Layout;
