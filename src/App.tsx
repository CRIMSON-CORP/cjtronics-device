import "./App.css";
import useAds from "./hooks/useAds";
import useServiceWorker from "./hooks/useServiceWorker";
import NoAdsScreen from "./NoAdsScreen";
import Player from "./Player";

function App() {
  const loaded = useServiceWorker();
  return loaded ? <LoadedApp /> : <NoAdsScreen />;
}

export default App;

function LoadedApp() {
  const { adGroups, widgets, screenConfig, sendLog } = useAds();

  if (adGroups.length >= 1) {
    return (
      <Player
        sendLog={sendLog}
        widgets={widgets}
        adGroups={adGroups}
        screenConfig={screenConfig}
      />
    );
  }

  return <NoAdsScreen />;
}
