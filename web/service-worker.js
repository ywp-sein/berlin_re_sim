const CACHE_NAME = "berlin-re-sim-v39";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./scenario-content.json",
  "./scenario-content.js",
  "./scenario.js",
  "./game.js",
  "./compare.html",
  "./compare.js",
  "./wiki.html",
  "./wiki.js",
  "./notes.html",
  "./notes.js",
  "./docs.html",
  "./docs.js",
  "./docs-content.json",
  "./docs-content.js",
  "./version-commits.json",
  "./.nojekyll",
  "./manifest.webmanifest",
  "./icon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).catch(() => caches.match("./index.html")));
    return;
  }
  if (new URL(event.request.url).pathname.endsWith("/version-commits.json")) {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
    return;
  }
  if (new URL(event.request.url).pathname.endsWith("/docs-content.json")) {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
    return;
  }
  if (new URL(event.request.url).pathname.endsWith("/docs-content.js")) {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
    return;
  }
  if (new URL(event.request.url).pathname.endsWith("/scenario-content.json")) {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
    return;
  }
  if (new URL(event.request.url).pathname.endsWith("/scenario-content.js")) {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request)),
  );
});
