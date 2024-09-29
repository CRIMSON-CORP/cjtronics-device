import { useCallback, useEffect, useState } from "react";
import useDeviceCode from "./useDeviceCode";

const { VITE_WEBSOCKET_URL } = import.meta.env;
function useSocket({ onReceiveAds }: { onReceiveAds: (data: any) => void }) {
  const deviceCode = useDeviceCode();
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    if (deviceCode) {
      let newSocket: WebSocket | null = null;
      const connect = () => {
        if (newSocket) {
          newSocket.close();
        }
        newSocket = new WebSocket(
          VITE_WEBSOCKET_URL + `?type=device&id=${deviceCode}`
        );

        newSocket.onopen = () => {
          setSocket(newSocket);
        };
        newSocket.onclose = () => {
          setSocket(null);
          console.log("Socket closed, reconnecting in 5 seconds");
          setTimeout(connect, 5000);
        };

        newSocket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.event === "send-to-device") {
            onReceiveAds(data.data);
            return;
          }

          if (data.event === "ping") {
            newSocket?.send(JSON.stringify({ event: "pong" }));
          }
        };
      };

      connect();

      const handleOnline = () => {
        if (!newSocket) {
          connect();
        }
      };

      window.addEventListener("online", handleOnline);

      return () => {
        window.removeEventListener("online", handleOnline);
        if (newSocket) {
          newSocket.close();
        }
      };
    }
  }, [deviceCode, onReceiveAds]);

  const sendLog = useCallback(
    ({
      adId,
      accountId,
      campaignId,
      messageType,
      uploadRef,
    }: SendLogParams) => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            event: "device-log",
            logs: {
              deviceId: "90J9R6",
              adId,
              accountId,
              campaignId,
              messageType,
              loggedOn: new Date().toISOString(),
              uploadRef,
            },
          })
        );
      } else {
        console.log("log cound not be sent as socket connection is lost");
      }
    },
    [socket]
  );

  return {
    sendLog,
  };
}

export default useSocket;
