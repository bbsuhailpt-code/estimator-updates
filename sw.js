// Estimator web/phone service worker: keeps the app working offline.
const VERSION = '0.4.0-mw0tmkqj';
const CACHE = 'estimator-' + VERSION;
const PRECACHE = ["./","index.html","manifest.webmanifest","favicon.png","icon-192.png","icon-512.png","apple-touch-icon.png","assets/pdf.worker.min-CIqJB0yW.mjs","assets/index-q9sXHFog.css","assets/index-BLDg0EzG.js","assets/index-BksfCpRV.js","assets/window-9QKMM9Hf.js","assets/index-BQ2L5PzK.js","assets/index-COq9IPpI.js","assets/core-BUhCcD2K.js","assets/jspdf.es.min-CqmxG-ED.js","assets/html2canvas.esm-B0tyYwQk.js","assets/purify.es-CAi2OJFm.js","assets/index.es-DGNVt4oz.js","assets/estimator_wasm_bg-Cbd3N7oa.wasm","assets/engineWorker-CvlCT28X.js"];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith('estimator-') && k !== CACHE && k !== 'estimator-runtime').map((k) => caches.delete(k)))),
  );
});

self.addEventListener('message', (e) => {
  if (e.data === 'skip-waiting') self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  // the page itself: newest when online, cached when offline
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match('index.html', { ignoreSearch: true }).then((r) => r || caches.match('./'))),
    );
    return;
  }
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(
      (hit) =>
        hit ||
        fetch(e.request).then((res) => {
          // pdf.js fonts and maps: keep after first use
          if (res.ok && url.pathname.includes('/pdfjs/')) {
            const copy = res.clone();
            caches.open('estimator-runtime').then((c) => c.put(e.request, copy));
          }
          return res;
        }),
    ),
  );
});
