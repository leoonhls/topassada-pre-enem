declare module "virtual:pwa-register" {
  type RegisterSWOptions = {
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
    immediate?: boolean;
  };

  // registerSW returns a function that can be used to trigger update (async)
  export function registerSW(options?: RegisterSWOptions): () => Promise<void>;

  export default registerSW;
}
