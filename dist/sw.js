var CACHE_VERSION = '2.0.0';
var CACHE_NAME = 'gamehub-v' + CACHE_VERSION;
var RUNTIME_CACHE = 'gamehub-runtime-v' + CACHE_VERSION;
var GAME_CACHE = 'gamehub-games-v' + CACHE_VERSION;

var SHELL_FILES = [
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

var RUNTIME_FILES = [
  '/snake/love.js',
  '/snake/love.wasm',
  '/escape-protocol/love.js',
  '/escape-protocol/love.wasm'
];

self.addEventListener('install', function(e) {
  self.skipWaiting();
  e.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then(function(cache) {
        return cache.addAll(SHELL_FILES).catch(function(err) {
          console.error('Failed to cache shell files:', err);
        });
      }),
      caches.open(RUNTIME_CACHE).then(function(cache) {
        return cache.addAll(RUNTIME_FILES).catch(function(err) {
          console.error('Failed to cache runtime files:', err);
        });
      })
    ])
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names
          .filter(function(n) {
            return n.startsWith('gamehub-') &&
                   n !== CACHE_NAME &&
                   n !== RUNTIME_CACHE &&
                   n !== GAME_CACHE;
          })
          .map(function(n) { return caches.delete(n); })
      );
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e) {
  var url = e.request.url;
  var request = e.request;

  if (request.method !== 'GET') {
    return;
  }

  if (url.includes('supabase.co')) {
    return;
  }

  if (url.includes('love.wasm') || url.includes('love.js')) {
    e.respondWith(
      caches.open(RUNTIME_CACHE).then(function(cache) {
        return cache.match(request).then(function(cached) {
          if (cached) {
            return cached;
          }
          return fetch(request).then(function(response) {
            if (response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          });
        });
      })
    );
    return;
  }

  if (url.includes('game.data')) {
    e.respondWith(
      caches.open(GAME_CACHE).then(function(cache) {
        return cache.match(request).then(function(cached) {
          var fetchPromise = fetch(request).then(function(response) {
            if (response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          });
          return cached || fetchPromise;
        });
      })
    );
    return;
  }

  if (url.includes('.html')) {
    e.respondWith(
      fetch(request).then(function(response) {
        if (response.ok) {
          return caches.open(CACHE_NAME).then(function(cache) {
            cache.put(request, response.clone());
            return response;
          });
        }
        return response;
      }).catch(function() {
        return caches.match(request);
      })
    );
    return;
  }

  if (url.includes('.css') || url.includes('.js') || url.includes('.png') || url.includes('.jpg') || url.includes('.svg')) {
    e.respondWith(
      caches.match(request).then(function(cached) {
        if (cached) {
          return cached;
        }
        return fetch(request).then(function(response) {
          if (response.ok) {
            return caches.open(CACHE_NAME).then(function(cache) {
              cache.put(request, response.clone());
              return response;
            });
          }
          return response;
        });
      })
    );
    return;
  }

  e.respondWith(
    fetch(request).catch(function() {
      return caches.match(request);
    })
  );
});