// Mỗi lần update code: đổi chuỗi này (YYYYMMDD-NNN)
const CACHE_NAME = 'pivo-20250609-001';

const STATIC_ASSETS = [
  './index.html'
];

// ---- Install: cache shell ----
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// ---- Activate: xóa cache cũ → claim → báo tất cả client reload ----
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
      )
      .then(() => self.clients.claim())
      .then(() =>
        self.clients.matchAll({ type: 'window', includeUncontrolled: true })
          .then(clients => clients.forEach(c => c.postMessage({ type: 'SW_UPDATED', version: CACHE_NAME })))
      )
  );
});

// ---- Fetch strategy ----
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Luôn network-first cho index.html (để version check hoạt động)
  if (url.pathname.endsWith('/') || url.pathname.endsWith('/index.html') || url.pathname === location.pathname) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then(res => {
          // Cập nhật cache với bản mới
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return res;
        })
        .catch(() => caches.match('./index.html')) // fallback offline
    );
    return;
  }

  // Luôn fetch live với API, CDN
  const alwaysLive = [
    'googleapis.com', 'accounts.google.com', 'api.telegram.org',
    'cdn.tailwindcss.com', 'cdnjs.cloudflare.com',
    'fonts.googleapis.com', 'fonts.gstatic.com'
  ];
  if (alwaysLive.some(domain => url.hostname.includes(domain))) {
    return;
  }

  // Các asset khác: cache-first
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});

// ---- Trả lời ping từ app để check version ----
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'GET_VERSION') {
    event.source.postMessage({ type: 'SW_VERSION', version: CACHE_NAME });
  }
});
