const CACHE = 'cubs-tix-v24';
const PRECACHE = [
  './',
  './index.html',
  './styles.css',
  './app.js?v=24',
  './images.js',
  './icon-192.png',
  './icon-512.png',
  './manifest.json',
];

// Install: cache all local assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

// Activate: remove old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: cache-first for local assets, network-first for Firebase/CDN
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const isLocal = url.origin === self.location.origin;
  const isFirebase = url.hostname.includes('firebase') || url.hostname.includes('googleapis') || url.hostname.includes('gstatic');

  if (isFirebase) {
    // Always go to network for Firebase (realtime data)
    return;
  }

  if (isLocal) {
    event.respondWith(
      caches.match(event.request).then(cached => cached || fetch(event.request))
    );
  }
});
