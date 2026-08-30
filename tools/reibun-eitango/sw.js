// =====================================================
// Service Worker（ネットワーク優先）
//  オンライン時：毎回サーバーから最新を取得（HTTPキャッシュも無視）。
//  取得したものはオフライン用に保存し、通信できないときはそれで動作する。
//  → 更新が端末のキャッシュに邪魔されず反映される。
// =====================================================
var CACHE = 'reibun-eitango-cache-v1';

self.addEventListener('install', function () {
  self.skipWaiting();               // すぐ有効化
});

self.addEventListener('activate', function (e) {
  e.waitUntil(self.clients.claim()); // 既存のタブもすぐ制御下に
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  try {
    if (new URL(req.url).origin !== self.location.origin) return;  // 同一オリジンのみ
  } catch (_) { return; }

  e.respondWith(
    fetch(req, { cache: 'no-store' }).then(function (res) {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put(req, copy); }).catch(function () {});
      return res;
    }).catch(function () {
      return caches.match(req);      // オフライン時は保存済みを返す
    })
  );
});
