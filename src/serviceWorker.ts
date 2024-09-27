export function register() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
      if (!navigator.serviceWorker.controller) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((r) => r.unregister()));
      }
      navigator.serviceWorker
        .register("/service-worker.js") // Make sure the path is correct
        .then((registration) => {
          console.log(
            "Service Worker registered with scope:",
            registration.scope
          );
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    });
  }
}

export function unregister() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.unregister();
    });
  }
}
