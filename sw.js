// Cache de l'application uniquement : les données (IndexedDB) ne sont jamais touchées.
const V = 'stockdiab-v5';
const FILES = ['./','index.html','styles.css','app.js','logic.js','i18n.js','install.js','manifest.webmanifest','decode.js','vendor/zxing-reader.iife.js','vendor/zxing_reader.wasm','icons/icon-192.png','icons/icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== V).map(x => caches.delete(x)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then(hit => {
    const net = fetch(e.request).then(r => { if (r.ok) caches.open(V).then(c => c.put(e.request, r.clone())); return r; }).catch(() => hit);
    return hit || net; // cache d'abord, mise à jour en arrière-plan
  }));
});
