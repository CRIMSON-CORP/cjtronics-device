import { customAlphabet } from "nanoid";
import { useEffect } from "react";
import useLocalStorage from "./useLocalStorage";

const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 10);
// const testDeviceCode = 'YCB7WU'
function useDeviceCode() {
  const { item: deviceCode, setItem } = useLocalStorage("device-code");

  useEffect(() => {
    if (!deviceCode) {
      setItem(nanoid(6));
    }
  }, [deviceCode, setItem]);

  return deviceCode;
}

export default useDeviceCode;
