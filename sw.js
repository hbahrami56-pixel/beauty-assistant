const CACHE_NAME = "beauty-assistant-v2";

const FILES = [
    "./",
    "./index.html",
    "./manifest.json"
];

// نصب نسخه جدید
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(FILES))
    );

    self.skipWaiting();
});

// حذف کش‌های قدیمی
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        })
    );

    self.clients.claim();
});

// دریافت فایل‌ها
self.addEventListener("fetch", event => {

    const request = event.request;

    // برای صفحه اصلی همیشه اول نسخه جدید را بگیر
    if (request.mode === "navigate") {

        event.respondWith(
            fetch(request)
                .then(response => {

                    const copy = response.clone();

                    caches.open(CACHE_NAME)
                        .then(cache => cache.put(request, copy));

                    return response;
                })
                .catch(() => {
                    return caches.match("./index.html");
                })
        );

        return;
    }

    // برای فایل‌های دیگر از کش استفاده کن
    event.respondWith(
        caches.match(request)
            .then(cached => {

                if (cached) {
                    return cached;
                }

                return fetch(request);
            })
    );
});
