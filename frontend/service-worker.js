// Service Worker for Progressive Web App
const CACHE_NAME = 'brainex-v1';
const STATIC_CACHE = 'brainex-static-v1';
const DYNAMIC_CACHE = 'brainex-dynamic-v1';

const STATIC_ASSETS = [
  '/',
  '/fields',
  '/scholarships',
  '/mentors',
  '/projects',
  '/events',
  '/assets/css/design-system.css',
  '/assets/css/main.css',
  '/assets/js/auth-api.js',
  '/assets/js/global.js',
];

// Install event
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');

  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );

  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );

  self.clients.claim();
});

// Fetch event - Network first, then cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // API requests - network first
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clonedResponse = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, clonedResponse);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // Static assets - cache first
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((response) => {
        return caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(request, response.clone());
          return response;
        });
      });
    })
  );
});

// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  try {
    // Sync any pending data
    console.log('[SW] Syncing data...');
  } catch (error) {
    console.error('[SW] Sync failed:', error);
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};

  const options = {
    body: data.body || 'New notification from BraineX',
    icon: '/assets/images/icon-192.png',
    badge: '/assets/images/badge-72.png',
    vibrate: [200, 100, 200],
    data: data,
  };

  event.waitUntil(self.registration.showNotification(data.title || 'BraineX', options));
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(clients.openWindow(event.notification.data.url || '/'));
});
