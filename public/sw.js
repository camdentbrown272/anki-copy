// Offline fallback: always try the network first (so updates show up), and
// keep a copy of each response. If the local server isn't running, the app
// still loads from that copy. Your decks are in localStorage, not here.
const CACHE = 'recall-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  // Leave Vite dev-server internals alone.
  if (url.pathname.startsWith('/@') || url.pathname.startsWith('/src/') || url.pathname.startsWith('/node_modules/')) return;

  const cacheKey = request.mode === 'navigate' ? '/' : request;
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          event.waitUntil(caches.open(CACHE).then((cache) => cache.put(cacheKey, copy)));
        }
        return response;
      })
      .catch(async () => (await caches.match(cacheKey)) ?? Response.error())
  );
});
