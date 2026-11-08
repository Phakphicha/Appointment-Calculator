/* =============================================================
 * EasyMedCal - Service Worker (offline support)
 * -------------------------------------------------------------
 * ⚠️ ทุกครั้งที่ deploy ไฟล์ใหม่ (HTML/JS/CSS/ข้อมูลวันหยุด) ให้เพิ่มเลข CACHE_VERSION
 *    และอัปเดต query string (?v=) ใน PRECACHE_URLS ให้ตรงกับใน index.html
 *
 * Strategies
 *  - Page navigations : network-first (เห็นเวอร์ชันล่าสุดเมื่อออนไลน์) -> fallback cache เมื่อออฟไลน์
 *  - Same-origin files: cache-first ตาม URL+?v= (ไฟล์ versioned) -> network
 *  - CDN (Tailwind, Phosphor icons, Google Fonts): stale-while-revalidate
 *  - Analytics (Google Analytics / GTM): ไม่ยุ่ง ปล่อยผ่าน network เสมอ
 * ============================================================= */
const CACHE_VERSION = 'v4';
const STATIC_CACHE = `emc-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `emc-runtime-${CACHE_VERSION}`;
const RUNTIME_MAX_ENTRIES = 60;

// Required for the app to work offline (install fails if any of these fail)
const PRECACHE_URLS = [
    '/',
    '/app.js?v=1.9',
    '/js/data/thai-holidays.js?v=1.0',
    '/js/core.js?v=1.2',
    '/js/i18n.js?v=1.1',
    '/js/pwa.js?v=1.0',
    '/styles.css?v=1.1',
    '/consent.js?v=1.0',
    '/site.webmanifest',
    '/favicon.ico',
    '/favicon-32x32.png',
    '/favicon-16x16.png',
    '/apple-touch-icon.png',
    '/android-chrome-192x192.png',
    '/android-chrome-512x512.png'
];

// Nice to have offline (failures are ignored)
const OPTIONAL_PAGES = [
    '/privacy.html',
    '/articles/adult-vaccine-schedule-2026'
];

// Third-party assets the UI depends on (fetched as no-cors, failures ignored)
const OPTIONAL_CDN = [
    'https://cdn.tailwindcss.com',
    'https://unpkg.com/@phosphor-icons/web',
    'https://fonts.googleapis.com/css2?family=Prompt:wght@400;500;600;700&display=swap'
];

const CDN_HOSTS = [
    'cdn.tailwindcss.com',
    'unpkg.com',
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'lh3.googleusercontent.com'
];

const BYPASS_HOSTS = [
    'www.googletagmanager.com',
    'www.google-analytics.com',
    'region1.google-analytics.com',
    'analytics.google.com',
    'stats.g.doubleclick.net'
];

// Redirected responses can't be used to answer navigations -> copy into a clean Response
async function cleanResponse(res) {
    if (!res || !res.redirected) return res;
    const body = await res.blob();
    return new Response(body, { status: res.status, statusText: res.statusText, headers: res.headers });
}

async function putSafe(cacheName, request, response) {
    try {
        const cache = await caches.open(cacheName);
        await cache.put(request, await cleanResponse(response));
    } catch (e) { /* quota or opaque issues: ignore */ }
}

async function trimCache(cacheName, maxEntries) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    for (let i = 0; i < keys.length - maxEntries; i++) {
        await cache.delete(keys[i]);
    }
}

self.addEventListener('install', (event) => {
    event.waitUntil((async () => {
        const cache = await caches.open(STATIC_CACHE);
        await cache.addAll(PRECACHE_URLS);

        await Promise.all(OPTIONAL_PAGES.map(async (url) => {
            try {
                const res = await fetch(url, { cache: 'no-cache' });
                if (res.ok) await cache.put(url, await cleanResponse(res));
            } catch (e) { /* ignore */ }
        }));

        const runtime = await caches.open(RUNTIME_CACHE);
        await Promise.all(OPTIONAL_CDN.map(async (url) => {
            try {
                const res = await fetch(url, { mode: 'no-cors' });
                await runtime.put(url, res);
            } catch (e) { /* ignore */ }
        }));
    })());
    // No automatic skipWaiting: the page shows an "Update" banner (js/pwa.js) instead
});

self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        const keep = [STATIC_CACHE, RUNTIME_CACHE];
        const names = await caches.keys();
        await Promise.all(names
            .filter((n) => n.startsWith('emc-') && !keep.includes(n))
            .map((n) => caches.delete(n)));
        await self.clients.claim();
    })());
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

async function handleNavigation(event) {
    const request = event.request;
    try {
        const preload = event.preloadResponse ? await event.preloadResponse : null;
        const res = preload || await fetch(request);
        if (res && res.ok) {
            const url = new URL(request.url);
            const key = url.origin + url.pathname; // ignore ?utm=... etc.
            event.waitUntil(putSafe(STATIC_CACHE, key, res.clone()));
        }
        return res;
    } catch (err) {
        const url = new URL(request.url);
        const candidates = [
            url.origin + url.pathname,
            url.pathname.endsWith('/') ? url.pathname + 'index.html' : url.pathname + '.html',
            url.pathname.replace(/\/index\.html$/, '/'),
            '/'
        ];
        for (const c of candidates) {
            const hit = await caches.match(c, { ignoreSearch: true });
            if (hit) return hit;
        }
        return new Response(
            '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
            '<title>Offline</title><body style="font-family:sans-serif;text-align:center;padding:40px">' +
            '<h1>ออฟไลน์ / Offline</h1><p>ไม่สามารถโหลดหน้านี้ได้ในขณะนี้ กรุณาเชื่อมต่ออินเทอร์เน็ต</p>' +
            '<p><a href="/">กลับหน้าหลัก / Home</a></p></body>',
            { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        );
    }
}

async function handleSameOriginAsset(event) {
    const request = event.request;
    const exact = await caches.match(request);
    if (exact) return exact;
    try {
        const res = await fetch(request);
        if (res && res.ok) event.waitUntil(putSafe(RUNTIME_CACHE, request, res.clone()).then(() => trimCache(RUNTIME_CACHE, RUNTIME_MAX_ENTRIES)));
        return res;
    } catch (err) {
        // Offline and this exact ?v= is not cached: fall back to any cached version of the same file
        const loose = await caches.match(request, { ignoreSearch: true });
        if (loose) return loose;
        throw err;
    }
}

async function handleCdn(event) {
    const request = event.request;
    const cached = await caches.match(request);
    const network = fetch(request).then((res) => {
        if (res && (res.ok || res.type === 'opaque')) {
            event.waitUntil(putSafe(RUNTIME_CACHE, request, res.clone()).then(() => trimCache(RUNTIME_CACHE, RUNTIME_MAX_ENTRIES)));
        }
        return res;
    }).catch(() => cached);
    return cached || network;
}

self.addEventListener('fetch', (event) => {
    const request = event.request;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
    if (BYPASS_HOSTS.includes(url.hostname)) return;

    if (request.mode === 'navigate') {
        event.respondWith(handleNavigation(event));
        return;
    }
    if (url.origin === self.location.origin) {
        if (url.pathname === '/sw.js') return;
        event.respondWith(handleSameOriginAsset(event));
        return;
    }
    if (CDN_HOSTS.includes(url.hostname)) {
        event.respondWith(handleCdn(event));
    }
});
