import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "@/components/ui/scrollbar.css";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { app } from "./firebase/config";
import { LoadScript } from "@react-google-maps/api";
import ServiceWorkerBanner from "./components/ServiceWorkerBanner";
import { setDeferredPrompt } from "./pwa/deferredPrompt";

console.log("Firebase iniciado:", app.name);

// Capture the beforeinstallprompt early and store it in a module variable
// so we don't need to attach it to window or log anything.
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e: Event) => {
    try {
      // @ts-ignore
      e.preventDefault();
    } catch (err) {}
    try {
      setDeferredPrompt(e);
    } catch (err) {}
  });
}

// If running on strict localhost, try to remove any previously-registered
// service workers and caches that might be serving stale HTML (like the
// Firebase hosting welcome page). This helps ensure the Vite dev server
// serves the correct content on localhost.
if (typeof window !== "undefined") {
  try {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1" || host === "::1") {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistrations().then((regs) => {
          regs.forEach((reg) => {
            try {
              reg.unregister();
            } catch (err) {}
          });
        });
      }

      if (window.caches) {
        caches.keys().then((keys) => {
          keys.forEach((k) => caches.delete(k));
        });
      }
    }
  } catch (err) {
    // silent
  }
}

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <ServiceWorkerBanner />
    <App />
  </AuthProvider>
);
