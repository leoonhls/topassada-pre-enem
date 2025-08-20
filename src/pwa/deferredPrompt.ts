// Small module-scoped storage for the beforeinstallprompt event so we
// don't have to attach it to window or log it. Components can read it
// during mount and the global listener in main.tsx writes it.
let _deferredPrompt: any = null;

export function setDeferredPrompt(e: any) {
  _deferredPrompt = e;
}

export function getDeferredPrompt(): any {
  return _deferredPrompt;
}

export function clearDeferredPrompt() {
  _deferredPrompt = null;
}
