// service-worker.js
// Install the service worker
const CACHE_NAME = "my-app-cache-v1";
const urlsToCache = [
  "/",
  // Add other static resources as needed
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheWhitelist.includes(cacheName)) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim(); // Take control of all open pages
      })
      .then(() => {
        // Send a message to the client (your app) that the service worker is activated
        self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({
              type: "SW_ACTIVATED",
              message: "Service Worker is activated and ready",
            });
          });
        });
      })
  );
});

self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);
  // Cache media files (e.g., .mp4, .jpg, .png) including videos
  if (
    requestUrl.pathname.startsWith("/upload/advert/") &&
    /\.(mp4|webm|jpg|png|jpeg|gif|webp)$/.test(requestUrl.pathname)
  ) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return (
          response ||
          fetch(event.request).then(async (networkResponse) => {
            const cache = await caches.open(CACHE_NAME);
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          })
        );
      })
    );
  } else {
    // For all other requests (like API requests), bypass the cache
    event.respondWith(fetch(event.request));
  }
});
