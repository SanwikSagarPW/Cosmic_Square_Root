const CACHE_NAME = 'cosmic-square-root-v3';
const BUILD_FILES = [
  'Build/Asteroid_destroyer.loader.js',
  'Build/Asteroid_destroyer.framework.js.gz',
  'Build/Asteroid_destroyer.data.gz',
  'Build/Asteroid_destroyer.wasm.gz',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const isBuildFile = BUILD_FILES.some((f) => url.pathname.endsWith(f.replace('Build', 'Build')));

  if (isBuildFile) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(event.request).then((cached) => {
          if (cached) return cached;
          return fetch(event.request).then((response) => {
            if (response.ok) cache.put(event.request, response.clone());
            return response;
          });
        })
      )
    );
  }
});
