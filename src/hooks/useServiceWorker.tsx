import { useCallback, useEffect, useState } from "react";
import { registerSW } from "virtual:pwa-register";

export function useServiceWorker() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [updateServiceWorker, setUpdateServiceWorker] = useState<
    null | ((reloadPage?: boolean) => Promise<void>)
  >(null);

  useEffect(() => {
    // Avoid registering the service worker on localhost (127.0.0.1 / ::1)
    // because it can interfere with development calls to Firestore or local emulators.
    try {
      const host =
        typeof window !== "undefined" ? window.location.hostname : "";
      if (host === "localhost" || host === "127.0.0.1" || host === "::1") {
        // do not register service worker in strict localhost environment
        return;
      }
    } catch (err) {
      // ignore and proceed to register
    }

    const updater = registerSW({
      onNeedRefresh() {
        setNeedRefresh(true);
      },
      onOfflineReady() {
        setOfflineReady(true);
      },
    });

    // registerSW returns an async function to trigger update
    setUpdateServiceWorker(() => updater);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doUpdate = useCallback(
    async (reloadPage = true) => {
      if (!updateServiceWorker) return;
      try {
        await updateServiceWorker(true);
        if (reloadPage) {
          // give the new SW a moment and then reload to use it
          window.location.reload();
        }
      } catch (err) {
        console.error("Error while updating service worker:", err);
      }
    },
    [updateServiceWorker]
  );

  return {
    needRefresh,
    offlineReady,
    setNeedRefresh,
    doUpdate,
  };
}
