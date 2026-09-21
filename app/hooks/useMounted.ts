import { useSyncExternalStore } from "react";

/**
 * Hook que retorna `true` após o componente ser montado no cliente.
 *
 * Útil para evitar hydration errors em componentes que precisam
 * renderizar diferente no servidor vs. cliente (ex: estados de loading).
 *
 * No servidor retorna `false`; no cliente retorna `true` após a montagem.
 * Usa `useSyncExternalStore` para garantir consistência entre server/client.
 */
function useMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export { useMounted };
