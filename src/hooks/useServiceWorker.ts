import { useEffect, useRef, useState } from "react";

function useServiceWorker(url?: string) {
  const [loaded, setLoaded] = useState(false);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    if ("serviceWorker" in navigator) {
      // Check if a service worker is already controlling the page
      if (navigator.serviceWorker.controller) {
        setLoaded(true); // If it's already active, mark as loaded
        return;
      }

      // Register the new service worker
      navigator.serviceWorker
        .register(url || "/service-worker.js")
        .then(() => {
          console.log("Service Worker registered");

          // Listen for messages from the service worker
          navigator.serviceWorker.addEventListener("message", (event) => {
            console.log("sw event");

            if (event.data && event.data.type === "SW_ACTIVATED") {
              setLoaded(true); // Mark the service worker as active
            }
          });
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    }
  }, [url]);

  return loaded;
}

export default useServiceWorker;
