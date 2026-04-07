// Minimal service worker to resolve 404 errors.
// This allows the browser to find an sw.js file even if no PWA logic is currently active.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  self.registration.unregister()
    .then(() => self.clients.matchAll())
    .then((clients) => {
      clients.forEach(client => client.navigate(client.url));
    });
});
