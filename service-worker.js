importScripts("/js/vendor/workbox/workbox-sw.js");

if (!!workbox) {
  workbox.setConfig({
    modulePathPrefix: "/js/vendor/workbox/",
    debug: false,
  });
  const { registerRoute } = workbox.routing;
  const { CacheFirst, StaleWhileRevalidate } = workbox.strategies;
  const { ExpirationPlugin } = workbox.expiration;
  registerRoute(
    // Cache style resources, i.e. CSS files.
    ({ request }) => request.destination === "style",
    // Use cache but update in the background.
    new StaleWhileRevalidate({
      // Use a custom cache name.
      cacheName: "css-cache",
    })
  );

  registerRoute(
    // Cache image files.
    ({ request }) => request.destination === "image",
    // Use the cache if it's available.
    new CacheFirst({
      // Use a custom cache name.
      cacheName: "image-cache",
      plugins: [
        new ExpirationPlugin({
          maxEntries: 30,
          // Cache for a month.
          maxAgeSeconds: 30 * 24 * 60 * 60,
        }),
      ],
    })
  );

  /*
  Install a new service worker and have it update
  and control a web page as soon as possible
  */
  workbox.core.skipWaiting();
  workbox.core.clientsClaim();
}
