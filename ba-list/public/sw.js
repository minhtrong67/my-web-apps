/* BA List – service worker
   - Trang HTML: network-first (luôn lấy bản mới nhất, mất mạng mới dùng bản cache) → không bị "shell cũ" sau khi deploy
   - /assets/* (tên file có hash): cache-first
   - Ảnh wiki: cache-first, giữ tối đa 700 ảnh */
const V = 'ba-list-v7', IMG = 'ba-img', SHELL = ['./', 'app/', 'favicon.svg', 'manifest.webmanifest']
self.addEventListener('install', (e) => e.waitUntil(caches.open(V).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())))
self.addEventListener('activate', (e) => e.waitUntil(
  caches.keys().then((k) => Promise.all(k.filter((x) => x !== V && x !== IMG).map((x) => caches.delete(x)))).then(() => self.clients.claim()),
))
async function trim(c) { const k = await c.keys(); if (k.length > 700) await c.delete(k[0]) }
self.addEventListener('fetch', (e) => {
  const r = e.request
  if (r.method !== 'GET') return
  const u = new URL(r.url)
  if (u.origin === location.origin) {
    if (r.mode === 'navigate') {
      e.respondWith(fetch(r).then((x) => { if (x.ok) caches.open(V).then((c) => c.put(r, x.clone())); return x }).catch(() => caches.match(r).then((h) => h || caches.match('./'))))
    } else if (u.pathname.includes('/assets/')) {
      e.respondWith(caches.match(r).then((h) => h || fetch(r).then((x) => { if (x.ok) caches.open(V).then((c) => c.put(r, x.clone())); return x })))
    } else {
      e.respondWith(caches.match(r).then((h) => {
        const n = fetch(r).then((x) => { if (x.ok) caches.open(V).then((c) => c.put(r, x.clone())); return x }).catch(() => h)
        return h || n
      }))
    }
  } else if (/\.(png|webp|jpe?g)$/i.test(u.pathname)) {
    e.respondWith(caches.open(IMG).then(async (c) => {
      const h = await c.match(r)
      if (h) return h
      try { const x = await fetch(r); if (x.ok || x.type === 'opaque') { c.put(r, x.clone()); trim(c) } return x } catch { return Response.error() }
    }))
  }
})
