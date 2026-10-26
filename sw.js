// Offline support: the app is one file, so cache it up front and keep Google Fonts after first load.
var VERSION = "cvc-v1";
var CORE = ["./", "./classroom-visual-companion.html", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/apple-touch-icon.png"];

self.addEventListener("install", function(e){
  e.waitUntil(caches.open(VERSION).then(function(c){ return c.addAll(CORE); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k !== VERSION; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener("fetch", function(e){
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  var fonts = url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
  if (url.origin !== location.origin && !fonts) return;
  // pages: network first so teacher updates arrive, cached copy when offline
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(function(r){
      var copy = r.clone(); caches.open(VERSION).then(function(c){ c.put(req, copy); }); return r;
    }).catch(function(){ return caches.match(req).then(function(m){ return m || caches.match("./classroom-visual-companion.html"); }); }));
    return;
  }
  // everything else: cache first, fill the cache as we go
  e.respondWith(caches.match(req).then(function(m){
    return m || fetch(req).then(function(r){
      if (r && (r.ok || r.type === "opaque")) { var copy = r.clone(); caches.open(VERSION).then(function(c){ c.put(req, copy); }); }
      return r;
    });
  }));
});
