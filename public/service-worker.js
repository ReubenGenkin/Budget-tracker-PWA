const CACHE_NAME = 'static-cache-v2';
const DATA_CACHE_NAME = 'data-cache-v1';

//setting which files get saved to offline
const FILES_TO_CACHE = [
    "./index.html",
    "./public/css/style.css",
    "./public/js/idb.js",
    "./public/js/index.js",
    "./public/icons/icon-144x144.png",
    "./public/icons/icon-152x152.png",
    "./public/icons/icon-192x192.png",
    "./public/icons/icon-384x384.png",
    "./public/icons/icon-512x512.png",
];

// cache necessary resources
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("Your files have been pre-cached successfully!");
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    // sets service worker to active
    self.skipWaiting();
})

// overwrite old cache
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keyList => {
            // `keyList` contains all cache in your github io for that username
            return Promise.all(
                keyList.map(key => {
                    //testing chache and overwriting
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        console.log('deleting cache : ' + key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    //allows page to be loaded
    self.clients.claim();
});

//testing fetch with cache
self.addEventListener('fetch', (e) => {
    console.log('fetch request : ' + e.request.url)
    e.respondWith(
        caches.match(e.request).then(function (request) {
            if (request) {
                console.log('responding with cache : ' + e.request.url)
                return request
            } else {
                console.log('file is not cached, fetching : ' + e.request.url)
                return fetch(e.request)
            }
        })
    )
})