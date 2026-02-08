import React, { useEffect, useState } from "react";
import { getDeferredPrompt, clearDeferredPrompt } from "@/pwa/deferredPrompt";

function isIOS() {
  return (
    /iPhone|iPad|iPod/.test(navigator.userAgent) && !(window as any).MSStream
  );
}

function isMobileOrTablet() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const mobileRegex = /Mobi|Android|iPhone|iPad|iPod|Tablet/i;
  if (mobileRegex.test(ua)) return true;
  // fallback: touch device with small width
  try {
    const maxTouch = (navigator as any).maxTouchPoints || 0;
    if (maxTouch > 0 && window.innerWidth <= 1200) return true;
  } catch (err) {
    // ignore
  }
  return false;
}

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [swControlling, setSwControlling] = useState<boolean | null>(null);
  const [manifestOk, setManifestOk] = useState<boolean | null>(null);

  useEffect(() => {
    // Adopt any prompt captured by main via the module storage
    try {
      const p = getDeferredPrompt();
      if (p) setDeferredPrompt(p);
    } catch (err) {}

    return () => {
      // clear any in-memory listeners; component has no global listeners now
    };
  }, []);

  async function handleInstall() {
    if (deferredPrompt) {
      try {
        // @ts-ignore
        await deferredPrompt.prompt();
        // @ts-ignore
        await deferredPrompt.userChoice;
        setDeferredPrompt(null);
        try {
          clearDeferredPrompt();
        } catch (err) {}
      } catch (_err) {
        // ignore user cancel or prompt errors in production
      }
      return;
    }

    // If we don't have the programmatic prompt, show generic installation instructions
    setShowInstructions(true);
  }

  // Only render on mobile/tablet-like devices
  if (!isMobileOrTablet()) return null;

  return (
    <div>
      <button
        onClick={handleInstall}
        className="w-full px-3 py-2 text-sm rounded bg-primary text-primary-foreground hover:opacity-95">
        Instalar APP
      </button>

      {showInstructions && (
        <div className="mt-2 rounded border p-3 bg-background text-sm text-foreground">
          {isIOS() ? (
            <div>
              Para instalar no iPhone/iPad: toque em{" "}
              <strong>Compartilhar</strong> e selecione{" "}
              <strong>Adicionar à tela de início</strong>.
            </div>
          ) : (
            <div>
              Caso não apareça o prompt automaticamente, abra o menu do
              navegador e selecione <strong>Instalar aplicativo</strong>{" "}
              (Chrome/Edge) ou use <strong>Adicionar à tela de início</strong>{" "}
              (Android).
            </div>
          )}
          <div className="mt-2 text-xs text-muted-foreground">
            Dica: atualize a página e aguarde alguns segundos se o botão não
            funcionar de imediato.
          </div>
          <div className="mt-2">
            <button
              className="px-2 py-1 text-xs rounded border"
              onClick={() => setShowInstructions(false)}>
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
