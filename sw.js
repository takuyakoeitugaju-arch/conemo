// CONEMO 入口ページを、電波がなくても開けるようにする。
// 控えるのはこのページ（index.html）だけ。Google への通信と測定のデータには触らない。
var C = 'conemo-front-v1';

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(C).then(function (c) { return c.add('./'); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== C; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

// ページを開くときは、まずネットから取り（最新に差し替え）、つながらなければ控えを出す
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || req.mode !== 'navigate' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(fetch(req).then(function (res) {
    if (res.ok) { var cp = res.clone(); caches.open(C).then(function (c) { c.put('./', cp); }); }
    return res;
  }).catch(function () { return caches.match('./'); }));
});
