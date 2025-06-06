// service-worker.js

const CACHE_NAME = 'my-cache-v1';
const URLS_TO_CACHE = [
  './',
  './index.html',
  './css/style.css',
  './js/script.js',
  './data/questions.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png'
];

// Beim Installieren des Service Workers Ressourcen zwischenspeichern
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

// Beim Abrufen von Ressourcen aus dem Cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse; // Aus dem Cache antworten
      }
      return fetch(event.request); // Wenn nicht im Cache, dann aus dem Netzwerk
    })
  );
});

// Beim Aktualisieren des Service Workers den alten Cache löschen
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});