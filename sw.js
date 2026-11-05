const CACHE_NAME = 'autogrigorean-offline-v2';
const BASE = new URL('./', self.location.href);
const APP_SHELL = [new URL('./', BASE).href, new URL('index.html', BASE).href, new URL('manifest.webmanifest', BASE).href, new URL('icon-192.png', BASE).href, new URL('icon-512.png', BASE).href];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('autogrigorean-offline-') && key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then(response => {
      if (response && response.ok) { const copy = response.clone(); caches.open(CACHE_NAME).then(cache => cache.put(new URL('index.html', BASE).href, copy)); }
      return response;
    }).catch(() => caches.match(new URL('index.html', BASE).href).then(response => response || caches.match(BASE.href))));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if (response && response.ok) caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone()));
    return response;
  })));
});
