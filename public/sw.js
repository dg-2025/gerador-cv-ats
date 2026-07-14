// Service Worker para Gerador CV ATS
const CACHE_NAME = 'cv-ats-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/imagens/logo/favicon.ico',
  '/imagens/logo/icons/icon-72x72.png',
  '/imagens/logo/icons/icon-96x96.png',
  '/imagens/logo/icons/icon-128x128.png',
  '/imagens/logo/icons/icon-144x144.png',
  '/imagens/logo/icons/icon-152x152.png',
  '/imagens/logo/icons/icon-192x192.png',
  '/imagens/logo/icons/icon-384x384.png',
  '/imagens/logo/icons/icon-512x512.png',
  '/imagens/logo/icons/icon-1024x1024.png',
  '/imagens/logo/icons/apple-touch-icon.png',
  '/imagens/logo/og-image.jpg'
];

const OFFLINE_FALLBACK = '/offline.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (url.pathname === '/sw.js' || url.pathname.startsWith('/_next/')) {
    event.respondWith(fetch(request));
    return;
  }

  if (request.method !== 'GET') {
    event.respondWith(fetch(request));
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then((response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                try {
                  cache.put(request, responseToCache);
                } catch (error) {
                }
              });

            return response;
          })
          .catch(() => {
            if (request.headers.get('accept')?.includes('text/html')) {
              return caches.match(OFFLINE_FALLBACK);
            }
            return new Response('', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});