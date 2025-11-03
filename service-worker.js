const CACHE_NAME = "cours-cache-v1";
const ASSETS = [
  "./",
  "index.html",
  "manifest.json",
  "icons/icon-192.png",
  "icons/icon-512.png"
  // أضف هنا ملفاتك الأخرى إذا وُجدت: "styles.css", "main.js", ...
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;

  // للصفحات: شبكة أولاً، ثم الكاش لو أوفلاين
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).catch(() => caches.match("index.html")));
    return;
  }

  // لباقي الملفات: Cache-first + تخزين نفس-الأصل فقط
  e.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(resp => {
        try {
          const sameOrigin = new URL(req.url).origin === self.location.origin;
          if (sameOrigin) {
            const copy = resp.clone();
            caches.open(CACHE_NAME).then(c => c.put(req, copy));
          }
        } catch (_) {}
        return resp;
      });
    })
  );
});
