const CACHE_NAME = 'jay-lyrics-cache-v19';

// 需要缓存的静态资源列表
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './lyrics-data.js',
  './manifest.json',
  // 专辑封面图片
  './专辑封面/11月的萧邦-2005.webp',
  './专辑封面/Jay-2000.webp',
  './专辑封面/七里香-2004.webp',
  './专辑封面/依然范特西-2006.webp',
  './专辑封面/八度空间-2002.webp',
  './专辑封面/十二新作-2012.webp',
  './专辑封面/叶惠美-2003.webp',
  './专辑封面/惊叹号-2011.webp',
  './专辑封面/我很忙-2007.webp',
  './专辑封面/范特西-2001.webp',
  './专辑封面/跨时代-2010.webp',
  './专辑封面/魔杰座-2008.webp'
];

// 安装 Service Worker，预缓存所有必要资源
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching app shell and covers with cache reload');
        // 使用 reload 请求绕过浏览器本地缓存，获取服务器最新版本
        const requests = ASSETS_TO_CACHE.map(url => {
          return new Request(url, { cache: 'reload' });
        });
        return cache.addAll(requests);
      })
      .then(() => self.skipWaiting())
  );
});

// 激活 Service Worker，清理过期的旧缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Clearing old cache', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 拦截 fetch 请求，实现离线缓存优先策略
self.addEventListener('fetch', event => {
  // 只拦截同源的 GET 请求
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true })
      .then(cachedResponse => {
        // 如果命中缓存，直接返回；否则发起网络请求
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then(networkResponse => {
            // 检查响应是否有效
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // 动态将请求缓存起来（可选，用于后续的新资源）
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          })
          .catch(() => {
            // 如果离线且网络请求失败
            console.log('[Service Worker] Network request failed and no cache hit.');
          });
      })
  );
});
