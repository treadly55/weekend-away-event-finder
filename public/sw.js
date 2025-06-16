// A unique name for our cache. Change this when you update the app files.
const CACHE_NAME = 'city-event-finder-v1';

// The list of files we want to cache. This is often called the "app shell".
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/manifest.json',
  '/icons/event-icon-192.png',
  '/icons/event-icon-512.png',
  '/icons/event-icon-180.png'
];

// Install event: fires when the browser installs the service worker.
self.addEventListener('install', (event) => {
  // We wait until the cache is opened and all our app shell files are added.
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache and caching app shell');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event: fires every time the app requests a resource (image, script, etc.)
self.addEventListener('fetch', (event) => {
  // We only want to handle GET requests.
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    // Check if the requested resource is in our cache.
    caches.match(event.request)
      .then((response) => {
        // If we have it in the cache, return it immediately.
        if (response) {
          return response;
        }
        
        // If it's not in the cache, fetch it from the network.
        return fetch(event.request);
      })
  );
});
