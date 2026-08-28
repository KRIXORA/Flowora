// Flowora service worker — network-first for HTML/JS so GitHub deploys update
const CACHE_NAME = 'flowora-cache-v11';

const PRECACHE = [
  './',
  './index.html',
  './manifest.json',
  './assets/icons/favicon.ico',
  './assets/icons/icon-192.webp',
  './assets/icons/icon-512.webp',
  './assets/icons/maskable-icon-512.webp',
  './assets/icons/apple-touch-icon.png',
  './assets/images/preview.webp',
  './assets/brand/krixora-mark.svg',
  './assets/css/variables.css',
  './assets/css/global.css',
  './assets/css/typography.css',
  './assets/css/layout.css',
  './assets/css/components.css',
  './assets/css/glassmorphism.css',
  './assets/css/animations.css',
  './assets/css/dashboard.css',
  './assets/css/planner.css',
  './assets/css/calendar.css',
  './assets/css/settings.css',
  './assets/css/responsive.css',
  './assets/css/premium.css',
  './assets/js/storage.js',
  './assets/js/utils.js',
  './assets/js/theme.js',
  './assets/js/router.js',
  './assets/js/components.js',
  './assets/js/dashboard.js',
  './assets/js/planner.js',
  './assets/js/pomodoro.js',
  './assets/js/calendar.js',
  './assets/js/goals.js',
  './assets/js/habits.js',
  './assets/js/analytics.js',
  './assets/js/settings.js',
  './assets/js/ai-hub.js',
  './assets/js/app.js',
  './assets/js/ux-polish.js',
  './assets/js/onboarding.js',
  './assets/js/review.js',
  './assets/js/reminders.js',
  './assets/js/templates.js',
  './assets/js/shortcuts.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(
        PRECACHE.map((url) =>
          cache.add(url).catch((err) => {
            console.warn('[SW] precache skip', url, err);
          })
        )
      )
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

function isHTML(request) {
  const accept = request.headers.get('accept') || '';
  return request.mode === 'navigate' || accept.includes('text/html');
}

function isCodeAsset(url) {
  return /\.(js|css|html)(\?|$)/i.test(url.pathname) || url.pathname.endsWith('/');
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Same-origin only for custom strategy
  if (url.origin !== self.location.origin) return;

  // HTML + JS + CSS: network first (so new GitHub files always load)
  if (isHTML(event.request) || isCodeAsset(url)) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() =>
          caches.match(event.request).then((cached) => cached || caches.match('./index.html'))
        )
    );
    return;
  }

  // Images/icons: cache first
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      });
    })
  );
});

self.addEventListener('push', (event) => {
  let data = { title: 'Flowora', body: 'Time to focus!', icon: 'assets/icons/icon-192.webp' };
  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch {
      data.body = event.data.text();
    }
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || 'assets/icons/icon-192.webp',
      vibrate: [200, 100, 200]
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow('./'));
});
