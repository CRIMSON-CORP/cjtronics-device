import { useEffect, useRef, useState } from "react";
import screenReferenceToConfig from "./lib/screen-config-map";

interface PlayerProps {
  screenConfig: ScreenConfig;
  adGroups: Ad[][];
  widgets: Ad[];
  sendLog?: (params: SendLogParams) => void;
}

function Player({ screenConfig, adGroups, widgets, sendLog }: PlayerProps) {
  const [screenView, setScreenView] = useState("player");
  const [completedScreen, setCompletedScreen] = useState<boolean[]>([]);

  const onComplete = () => {
    setCompletedScreen((prev) => [...prev, true]);
  };

  const onWidgetComplete = () => {
    setScreenView("player");
    setCompletedScreen([]);
  };

  useEffect(() => {
    if (adGroups.length !== 0 || widgets.length !== 0) {
      if (completedScreen.length === adGroups.length && widgets.length > 0) {
        setScreenView("widgets");
      } else {
        if (completedScreen.length === adGroups.length) {
          setCompletedScreen([]);
          setScreenView("player" + new Date().getTime());
        }
      }
    }
  }, [completedScreen, adGroups, widgets]);

  useEffect(() => {
    setCompletedScreen([]);
  }, [screenView]);

  return (
    <div className="w-full h-full overflow-hidden p-0 flex bg-black">
      {screenView.startsWith("player") ? (
        <Screen screenLayoutRef={screenConfig.layoutReference}>
          {adGroups.map((list, index) => (
            <View
              ads={list}
              key={index}
              screenView={screenView}
              setScreenView={setScreenView}
              onComplete={onComplete}
              sendLog={sendLog}
            />
          ))}
        </Screen>
      ) : (
        <Screen screenLayoutRef="VBSGTREW43">
          <View ads={widgets} onComplete={onWidgetComplete} />
        </Screen>
      )}
    </div>
  );
}

export default Player;

interface ScreenProps {
  screenLayoutRef: string;
  children: React.ReactNode;
}

function Screen({ children, screenLayoutRef }: ScreenProps) {
  const layoutConfig = screenReferenceToConfig[screenLayoutRef];

  const screenStyle = {
    display: "grid",
    overflow: "hidden",
    ...(layoutConfig.horizontal
      ? {
          gridTemplateColumns: layoutConfig.split
            ? layoutConfig.split
                .split(",")
                .map((split) => +split / 100 + "fr")
                .join(" ")
            : "1fr",
        }
      : {
          gridTemplateRows: layoutConfig.split
            ? layoutConfig.split
                .split(",")
                .map((split) => +split / 100 + "fr")
                .join(" ")
            : "1fr",
        }),
    aspectRatio: layoutConfig.landscape ? "16/9" : "9/16",
    ...(layoutConfig.landscape
      ? {
          width: "100vw",
          height: "auto",
        }
      : {
          width: "auto",
          height: "100vh",
        }),
  };

  return <div style={screenStyle}>{children}</div>;
}

interface ViewProps {
  ads: Ad[];
  onComplete: () => void;
  screenView?: string;
  setScreenView?: React.Dispatch<React.SetStateAction<string>>;
  sendLog?: (params: SendLogParams) => void;
}

const days: string[] = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function adCanPlayToday(ad: Ad) {
  return ad.adConfiguration.days.includes(days[new Date().getDay()]);
}

function adCanPlayNow(ad: Ad) {
  const startTime = new Date(ad.adConfiguration.startTime).getTime();
  const endTime = new Date(ad.adConfiguration.endTime).getTime();
  return startTime <= new Date().getTime() && new Date().getTime() <= endTime;
}

function View({ ads, screenView, onComplete, sendLog }: ViewProps) {
  const sequence = ads;

  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> = 0;
    if (currentAdIndex < sequence.length) {
      const adToPlay = sequence[currentAdIndex];
      const adDuration = adToPlay.adConfiguration.duration * 1000; // Convert to milliseconds

      if (!adCanPlayToday(adToPlay) || !adCanPlayNow(adToPlay)) {
        {
          setCurrentAdIndex((prevIndex) => prevIndex + 1);
          sendLog?.({
            accountId: adToPlay.adAccountId,
            adId: adToPlay.adId,
            campaignId: adToPlay.campaignId,
            messageType: "skipped",
            uploadRef: adToPlay.uploadRef,
          });
        }
      } else {
        sendLog?.({
          accountId: adToPlay.adAccountId,
          adId: adToPlay.adId,
          campaignId: adToPlay.campaignId,
          messageType: "play",
          uploadRef: adToPlay.uploadRef,
        });

        timer = setTimeout(() => {
          setCurrentAdIndex((prevIndex) => prevIndex + 1);
        }, adDuration);
      }

      return () => clearTimeout(timer); // Clear the timer when component unmounts or index changes
    } else {
      onComplete();
      // setTimeout(() => {
      //   setCurrentAdIndex(0);
      // }, 1000 * 20);
    }
  }, [currentAdIndex, onComplete, sendLog, sequence]);

  useEffect(() => {
    setCurrentAdIndex(0);
  }, [screenView, sequence]);

  return (
    <div className="overflow-hidden">
      <div
        className="flex items-center w-full h-full flex-1 relative"
        style={{
          transition: currentAdIndex === 0 ? "none" : "transform 1s ease-out",
          transform: `translateX(-${currentAdIndex * 100}%)`,
        }}
      >
        {sequence.map((file, index) => {
          return (
            <div
              key={index}
              className="w-full h-full flex-none absolute"
              style={{ transform: `translateX(${index * 100}%)` }}
            >
              {file.adType === "image" ? (
                <img
                  src={file.adUrl}
                  alt={file.uploadName}
                  width={500}
                  height={400}
                  key={currentAdIndex}
                  style={{
                    objectFit: "contain",
                    width: "100%",
                    height: "100%",
                  }}
                />
              ) : file.adType === "video" ? (
                <video
                  loop
                  key={currentAdIndex}
                  controls={false}
                  src={file.adUrl}
                  muted={true}
                  autoPlay={index === currentAdIndex}
                  style={{
                    objectFit: "contain",
                    width: "100%",
                    height: "100%",
                  }}
                />
              ) : file.adType === "iframe" ? (
                file.adUrl.startsWith("<iframe") ? (
                  <Iframe
                    content={file.adUrl}
                    styles={{ width: "100%", height: "100%", border: "none" }}
                  />
                ) : (
                  <iframe
                    src={file.adUrl}
                    style={{ width: "100%", height: "100%", border: "none" }}
                  ></iframe>
                )
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface IframeProps {
  content: string;
  styles: React.CSSProperties;
}

function Iframe({ content, styles }: IframeProps) {
  const iframeContainer = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (iframeContainer.current) {
      iframeContainer.current.innerHTML = content;
      const { firstElementChild } = iframeContainer.current;
      if (firstElementChild && firstElementChild instanceof HTMLElement) {
        firstElementChild.style.height = "100%";
        firstElementChild.style.width = "100%";
      }
    }
  }, [content]);
  return <div ref={iframeContainer} style={styles}></div>;
}
