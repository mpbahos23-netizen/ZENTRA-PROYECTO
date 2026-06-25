// ZENTRA OS - Service Worker v3.0
const CACHE_NAME = 'zentra-os-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/zentra-logo.jpg',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

self.addEventListener('install', event => {
  // Skip waiting to activate immediately
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  // Clean up old caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Network-first strategy for API calls and navigation
  const url = new URL(event.request.url);
  
  // Always go to network for API calls, Supabase, auth
  if (url.hostname !== self.location.hostname || 
      url.pathname.startsWith('/rest/') ||
      url.pathname.startsWith('/auth/') ||
      event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clone and cache successful responses
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache if offline
        return caches.match(event.request).then(cached => {
          return cached || caches.match('/index.html');
        });
      })
  );
});
