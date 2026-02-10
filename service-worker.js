// Service Worker for PWA
const CACHE_NAME = 'vocabulary-cards-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/js/srs-engine.js',
  '/cards.json'
];

// Install event - cache files
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Service Worker: Cache failed', error);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip API requests (let them go to network)
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch((error) => {
          console.log('Service Worker: Fetch failed, returning offline page', error);
          // You could return a custom offline page here
        });
      })
  );
});

// Background sync (optional - for future implementation)
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event.tag);
  if (event.tag === 'sync-cards') {
    event.waitUntil(syncCards());
  }
});

async function syncCards() {
  // Placeholder for future sync functionality
  console.log('Syncing cards...');
}

// Push notification (optional - for future implementation)
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received', event);
  const options = {
    body: event.data ? event.data.text() : '새로운 복습 알림이 있습니다!',
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    vibrate: [200, 100, 200]
  };

  event.waitUntil(
    self.registration.showNotification('나만의 영어 단어장', options)
  );
});
