const CACHE_NAME = "kilimo-tech-cache-v1";

// Files to cache immediately (app shell icons)
const PRECACHE_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png"
];

// Install event - precache basic assets and skip waiting
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn("Pre-caching assets failed, they will be cached at runtime:", err);
      });
    })
  );
  self.skipWaiting();
});

// Activate event (cleans up old caches and claims control)
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("Deleting old service worker cache:", cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event (Network First, falling back to cache)
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Skip APIs, Firebase, Firestore, and WebSocket connections
  if (
    url.pathname.startsWith("/api") ||
    url.href.includes("firestore.googleapis.com") ||
    url.href.includes("firebase") ||
    event.request.url.includes("socket.io") ||
    event.request.url.includes("ws://") ||
    event.request.url.includes("wss://")
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If we got a valid response, clone it and save it in the cache for offline use
        if (response && response.status === 200 && response.type === "basic") {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // If network fails (user is offline), try to return from cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If it is a page navigation and we are offline, serve the cached index.html
          if (event.request.mode === "navigate") {
            return caches.match("/");
          }
        });
      })
  );
});



