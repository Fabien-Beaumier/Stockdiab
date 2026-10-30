// Cache de l'application uniquement : les données (IndexedDB) ne sont jamais touchées.
const V = 'stockdiab-v7';
const FILES = ['./','index.html','styles.css','app.js','logic.js','i18n.js','install.js','decode.js','manifest.webmanifest','vendor/zxing-reader.iife.js','vendor/zxing_reader.wasm','icons/icon-192.png','icons/icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== V).map(x => caches.delete(x)))).then(() => self.clients.claim())); });
const store = (req, res) => { if (res.ok) { const c = res.clone(); caches.open(V).then(x => x.put(req, c)); } return res; };
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return; // liens externes non interceptés
  const fixe = /\/(vendor|icons)\//.test(u.pathname);
  e.respondWith(fixe
    ? caches.match(r, { ignoreSearch: true }).then(hit => hit || fetch(r).then(res => store(r, res)))      // fichiers lourds : cache d'abord
    : fetch(r).then(res => store(r, res)).catch(() => caches.match(r, { ignoreSearch: true }).then(hit => hit || caches.match('index.html')))); // appli : réseau d'abord, cache hors ligne
});
