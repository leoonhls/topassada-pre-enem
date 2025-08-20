// Custom service worker wrapper used with injectManifest to ensure
// the worker calls skipWaiting & clients.claim so it takes control
// quickly after installation.
import { precacheAndRoute } from "workbox-precaching";

// Precache manifest will be injected here by workbox-build during the injectManifest step.
// The token below must be present exactly as shown for injection to succeed.
precacheAndRoute(self.__WB_MANIFEST || []);

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      if (self.clients && self.clients.claim) {
        await self.clients.claim();
      }
    })()
  );
});

// Note: injectManifest will append the precache manifest here during build.
// Keep the fetch handler or other runtime behavior default (workbox will
// inject handlers as needed).
