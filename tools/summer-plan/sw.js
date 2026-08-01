// =====================================================
// Service Worker（ネットワーク優先）
//  オンライン時：毎回サーバーから最新を取得（HTTPキャッシュも無視）。
//  取得したものはオフライン用に保存し、通信できないときはそれで動作する。
//  → GitHub に上げた更新が、端末のキャッシュに邪魔されず反映される。
//  ※ 学習記録は localStorage にあり、このキャッシュとは無関係（消えない）。
// =====================================================
var CACHE = 'summer-plan-cache-v1';

self.addEventListener('install', function (e) {
  self.skipWaiting(); // すぐ有効化
});

self.addEventListener('activate', function (e) {
  e.waitUntil(self.clients.claim()); // 既存のタブもすぐ制御下に
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  // 同一オリジンのみ扱う
  try {
    if (new URL(req.url).origin !== self.location.origin) return;
  } catch (_) { return; }

  e.respondWith(
    // no-store でブラウザのHTTPキャッシュも通さず、必ずネットワークから取得
    fetch(req, { cache: 'no-store' }).then(function (res) {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put(req, copy); }).catch(function () {});
      return res;
    }).catch(function () {
      // オフライン等でネットワーク失敗 → 保存済みを返す
      return caches.match(req);
    })
  );
});
