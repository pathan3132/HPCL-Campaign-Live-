const cacheName = 'atc-v1';
const staticAssets = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './images/ATC_Logo.png',
  './images/Background.png',
  './images/sign.png'
];

self.addEventListener('install', async e => {
  const cache = await caches.open(cacheName);
  await cache.addAll(staticAssets);
});

self.addEventListener('fetch', e => {
  e.respondWith(
    (async () => {
      const cache = await caches.open(cacheName);
      const res = await cache.match(e.request);
      return res || fetch(e.request);
    })()
  );
});