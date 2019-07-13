const staticCacheName = 'site-static-v3';
const dynamicCacheName = 'site-dynamic-v3'
const assets = [
  '/',
  '/index.html',
  '/pages/fallback.html',
  '/js/app.js',
  '/js/ui.js',
  '/js/materialize.min.js',
  '/css/styles.css',
  '/css/materialize.min.css',
  '/img/dish.png',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://fonts.gstatic.com/s/materialicons/v47/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2'
];

// cache size limit function
const limitCacheSize = (name, size) => {
  caches.open(name).then(cache => {
    cache.keys().then(keys => {
      if (keys.length > size) {
        cache.delete(keys[0]).then(limitCacheSize(name, size));
      }
    })
  })
}

// install event
self.addEventListener('install', evt => {
  //console.log('service worker installed');
  evt.waitUntil(
    caches.open(staticCacheName).then(cache => {
      console.log('caching shell assets');
      cache.addAll(assets);
    })
  );
});

// activate event
self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys
        .filter(key => key !== staticCacheName && key !== dynamicCacheName)
        .map(key => caches.delete(key))  
      )
    })
  )
});

// fetch event
self.addEventListener('fetch', evt => {
  if (evt.request.url.indexOf('firestore.googleapis.com') < 0) {
    evt.respondWith(
      caches.match(evt.request)
        .then(
          cacheRes => cacheRes || fetch(evt.request)
          .then(fetchRes => 
            caches.open(dynamicCacheName)
              .then(cache => {
                cache.put(evt.request.url, fetchRes.clone());
                limitCacheSize(dynamicCacheName, 15)
                return fetchRes
              })
          )
        )
        .catch(() => {
          if (evt.request.url.indexOf('.html') > -1)
            return caches.match('/pages/fallback.html')
        })
    )
  }
});