/* ============================================================
   AURA WEALTH OS - SERVICE WORKER (OFFLINE PWA ENGINE)
   ============================================================ */

// IMPORTANT: bump this version string every time you change
// index.html, styles.css, or app.js. Changing this string is what
// forces every installed browser to drop its stale cache and
// re-fetch fresh files. Forgetting to bump it is exactly what
// caused the "white text in light mode" bug.
const CACHE_NAME = 'aura-wealth-v6';

// Files that change frequently - always try network first so users
// get updates immediately, falling back to cache only if offline.
const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './supabase.js',
  './aura-hardening-v2.js',
  './aura-sync-fix.js',
  './aura-sync-race-fix.js',
  './aura-realtime-v3.js',
  './aura-v3-dashboard.js',
  './aura-ui-theme.css',
  './aura-v3-dashboard.css'
];

// Files that rarely/never change - safe to serve cache-first.
const STATIC_ASSETS = [
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Manrope:wght@300..800&display=swap',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];

// Install Event - Pre-cache everything, but don't let a failed
// network fetch during install block activation.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([...APP_SHELL, ...STATIC_ASSETS]).catch((err) => {
        console.warn('SW cache.addAll non-critical asset warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean out every cache that isn't the current version.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Network-first for the app shell (HTML/CSS/JS),
// cache-first for static assets, with offline fallback either way.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Ignore non-http/https schemes (e.g. chrome-extension://, data:)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }

  const isAppShell = event.request.mode === 'navigate' ||
    APP_SHELL.some((path) => url.pathname.endsWith(path.replace('./', '/')) || url.pathname.endsWith('/'));

  if (isAppShell) {
    // Network-first: always try to get the latest file. Only fall
    // back to whatever's cached if the network request fails.
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
          }
          return networkResponse;
        })
        .catch(() => caches.match(event.request).then((cached) => {
          if (cached) return cached;
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('./index.html');
          }
        }))
    );
    return;
  }

  // Cache-first for static assets (fonts, CDN libs, manifest, icons).
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        return networkResponse;
      }).catch(() => {
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('./index.html');
        }
      });
    })
  );
});