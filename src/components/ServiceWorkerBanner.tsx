import React from "react";
import { useServiceWorker } from "@/hooks/useServiceWorker";

export default function ServiceWorkerBanner() {
  const { needRefresh, offlineReady, setNeedRefresh, doUpdate } =
    useServiceWorker();

  if (!needRefresh && !offlineReady) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="max-w-xl px-4 py-3 bg-card border rounded-lg shadow-md flex items-center gap-3">
        <div className="flex-1 text-sm">
          {needRefresh ? (
            <div>
              Nova versão disponível. Deseja atualizar para aplicar as mudanças?
            </div>
          ) : null}
        </div>

        {needRefresh && (
          <>
            <button
              className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm"
              onClick={() => doUpdate(true)}>
              Atualizar
            </button>
            <button
              className="px-3 py-1 border rounded text-sm"
              onClick={() => setNeedRefresh(false)}>
              Fechar
            </button>
          </>
        )}
      </div>
    </div>
  );
}
