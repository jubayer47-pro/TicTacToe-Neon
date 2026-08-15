const CACHE_NAME = "tic-tac-toe-neon-v1";

const APP_FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./tic-tac-toe-icon-192x192.png",
  "./tic-tac-toe-icon-512x512-1.png"
];

// Install
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

// Activate
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Save successful same-origin responses
        if (
          response &&
          response.status === 200 &&
          new URL(event.request.url).origin === self.location.origin
        ) {
          const responseClone = response.clone();

          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }

        return response;
      })
      .catch(() => {
        return caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }

            // Offline navigation fallback
            if (event.request.mode === "navigate") {
              return caches.match("./index.html");
            }
          });
      })
  );
});
