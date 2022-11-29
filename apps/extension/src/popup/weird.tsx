import React from "react";

const WEB_URL = process.env.PLASMO_PUBLIC_WEB_URL as string;

const Popup: React.FC = () => {
  const [failed, setFailed] = React.useState(false);

  const sendMesageToContentScript = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      const { id, url } = tab;

      if (
        url?.startsWith("chrome://") ||
        url?.startsWith("https://chrome.google.com/webstore")
      ) {
        window.open(`${WEB_URL}/open`);
      } else if (id) {
        chrome.tabs.sendMessage(id, { openCalendar: true });
        window.close();
      } else {
        console.log("No tab id found");
        setFailed(true);
      }
    });
  };

  React.useEffect(() => {
    sendMesageToContentScript();
  }, []);

  if (failed) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-2xl font-bold">Failed to open calendar</h1>
      </div>
    );
  }

  return <div />;
};

export default Popup;
