const version = "0.1.0";
const cacheName = "boidacarapreta-arc20202-twine";
const precacheResources = [
  "./assets/logo-128.png",
  "./assets/logo-192.png",
  "./assets/logo-256.png",
  "./assets/logo-384.png",
  "./assets/logo-512.png",
  "./index.html",
  "./manifest.json",
  "./sw.js",
];

self.addEventListener("install", (event) => {
  console.log("Service worker install event!");
  event.waitUntil(
    caches.open(cacheName).then((cache) => {
      return cache.addAll(precacheResources).then(() => self.skipWaiting());
    })
  );
});

self.addEventListener("activate", (event) => {
  console.log("Service worker activate event!");
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  console.log("Fetch intercepted for: ", event.request.url);
  event.respondWith(
    caches
      .open(cacheName)
      .then((cache) => cache.match(event.request, { ignoreSearch: true }))
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});
