// Mỗi lần update code: đổi ngày thành ngày hôm đó (YYYYMMDD)
const CACHE_NAME = 'crm-satelier-20250607';

// Chỉ cache UI shell, không cache API/Google Sheets
const STATIC_ASSETS = [
  './',
  './index.html'
];

// ---- Install: cache shell ----
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// ---- Activate: xóa cache cũ, báo app reload ----
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
      )
      .then(() => self.clients.claim())
      .then(() =>
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients =>
          clients.forEach(client => client.postMessage({ type: 'SW_UPDATED' }))
        )
      )
  );
});

// ---- Fetch strategy ----
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Luôn fetch live với API, Google, CDN
  const alwaysLive = [
    'googleapis.com',
    'accounts.google.com',
    'api.telegram.org',
    'cdn.tailwindcss.com',
    'cdnjs.cloudflare.com',
    'fonts.googleapis.com',
    'fonts.gstatic.com'
  ];

  if (alwaysLive.some(domain => url.hostname.includes(domain))) {
    return; // browser fetch bình thường
  }

  // Shell: cache-first, fallback network
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
