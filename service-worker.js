const CACHE_NAME = 'my-cache-v21';
const URLS_TO_CACHE = [
  './',
  './index.html',
  './css/style.css',
  './js/script.js',
  './data/questions.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  './lang/lang_de.json',
  './lang/lang_eng.json',
  './lang/lang_ron.json',
  './data/share_button.png',
  './data/info_icon.webp'
];

// Sofort aktivieren
self.addEventListener('install', (event) => {
  self.skipWaiting(); // << Neu: sofort aktivieren
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE))
  );
});

// Alte Caches löschen
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim()) // << Neu: übernimmt sofort Kontrolle
  );
});

// Ressourcen aus dem Cache oder Netz holen
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) =>
      cachedResponse || fetch(event.request)
    )
  );
});
