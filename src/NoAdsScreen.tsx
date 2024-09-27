import { useEffect, useState } from "react";
import useDeviceCode from "./hooks/useDeviceCode";

function NoAdsScreen() {
  return (
    <div className="h-full flex flex-col justify-center gap-[5vh] items-center p-10 text-center">
      <div className="bg-white p-[2vh] rounded-[5vh]">
        <img src="/logo.png" alt="Cjtronics" className="max-h-[20vh]" />
      </div>
      <h1 className="text-[max(10vw,32px)]">
        Device Id: <DeviceId />
      </h1>
      <p className="text-[max(1.5vw,12px)]">
        Or visit{" "}
        <a className="underline" href="https://cjtronicsbyfolham.com">
          https://cjtronicsbyfolham.com
        </a>{" "}
        and enter the code below as your device ID to synchronise your device
        with the platform
      </p>
      <InstallServiceWorker />
    </div>
  );
}

export default NoAdsScreen;

function DeviceId() {
  const deviceCode = useDeviceCode();
  return deviceCode;
}

function InstallServiceWorker() {
  const [installEvent, setInstallEvent] = useState<any>(null);
  useEffect(() => {
    const installPromptEvent = (e: any) => {
      e.preventDefault();
      setInstallEvent(e);
      window.addEventListener("appinstalled", () => {
        setInstallEvent(null);
      });
    };
    window.addEventListener("beforeinstallprompt", installPromptEvent);
  }, []);

  const onInstallClick = () => {
    if (installEvent) {
      installEvent.prompt();
    }
  };

  if (!installEvent) {
    return null;
  }

  return (
    <button
      onClick={onInstallClick}
      className="bg-white rounded-md text-black text-xl px-5 py-3"
    >
      Install Device
    </button>
  );
}
