import { useCallback, useEffect, useMemo, useState } from "react";
import useDeviceCode from "./useDeviceCode";
import useSocket from "./useSocket";

function useAds() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [screenConfig, setScreenConfig] = useState<ScreenConfig>({
    city: "",
    deviceId: "",
    layout: "",
    layoutReference: "",
    screenHeight: "",
    screenId: "",
    screenLayoutConfig: { width: 0 },
    screenName: "",
    screenResolution: "",
    screenWidth: "",
    ttl: "",
  });
  const deviceCode = useDeviceCode();

  const setReceivedAds = useCallback((data: any) => {
    setAds(data.data[0].campaigns);
    setScreenConfig(data.config);
  }, []);

  const { sendLog } = useSocket({
    onReceiveAds: setReceivedAds,
  });

  const fetchAds = useCallback(async () => {
    try {
      const response = await fetch(
        `https://cjtronics.tushcode.com/v1/public-advert/campaigns/${deviceCode}`
      );
      const data: { config: ScreenConfig; data: [{ campaigns: Ad[] }] } =
        await response.json();

      setAds(data.data[0].campaigns);
      setScreenConfig(data.config);
    } catch (error: any) {
      console.log(error.response?.data?.message || error.message);
    }
  }, [deviceCode]);

  useEffect(() => {
    if (deviceCode) {
      fetchAds();
    }
  }, [fetchAds, deviceCode]);

  const filteredAds = useMemo(() => {
    const mediaUrls = ads.map((ad) => ad.adUrl);
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        action: "CACHE_MEDIA",
        mediaUrls,
      });
    }

    const filteredCampaigsWithoutView = ads.filter(
      (campaign) => campaign.campaignView
    );

    const widgets = ads.filter((campaign) =>
      ["time", "weather"].includes(campaign.adId)
    );

    const grouped = filteredCampaigsWithoutView.reduce(
      (acc: [Ad[], Ad[]], obj) => {
        if (obj.campaignView === 1) {
          acc[0].push(obj);
        } else {
          acc[1].push(obj);
        }
        return acc;
      },
      [[], []]
    );

    const filteredGroup = grouped.filter((group) => group.length > 0);

    return {
      adGroups: filteredGroup,
      widgets,
    };
  }, [ads]);

  return { ...filteredAds, screenConfig, sendLog };
}

export default useAds;
