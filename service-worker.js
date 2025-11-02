// /Cours/service-worker.js
const CACHE_NAME = "cours-cache-v1";
const ASSETS = [
  "/Cours/",
  "/Cours/index.html",
  // أضف هنا ملفاتك الحقيقية:
  // "/Cours/styles.css",
  // "/Cours/main.js",
  // "/Cours/icons/icon-192.png",
  // "/Cours/icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((resp) => {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then((cache) => {
            try { cache.put(request, copy); } catch (_) {}
          });
          return resp;
        })
        .catch(() => {
          // ممكن ترجع صفحة Offline هنا لو أنشأتها:
          // return caches.match("/Cours/offline.html");
        });
    })
  );
});
