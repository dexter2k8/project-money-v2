import { useCallback, useEffect, useState } from "react";

const LOCAL_STORAGE_CHANGE = "local-storage-change";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    const stored = localStorage.getItem(key);
    return stored !== null ? (JSON.parse(stored) as T) : initialValue;
  });

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent | CustomEvent) => {
      const eventKey = e instanceof CustomEvent ? e.detail?.key : e.key;
      const newValue = e instanceof CustomEvent ? e.detail?.newValue : e.newValue;
      if (eventKey !== key) return;
      setValue(newValue !== null ? (JSON.parse(newValue) as T) : initialValue);
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(LOCAL_STORAGE_CHANGE, handleStorageChange as EventListener);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(LOCAL_STORAGE_CHANGE, handleStorageChange as EventListener);
    };
  }, [key, initialValue]);

  const setStoredValue = useCallback(
    (newValue: T | null) => {
      if (newValue === null) {
        setValue(initialValue);
        localStorage.removeItem(key);
      } else {
        setValue(newValue);
        localStorage.setItem(key, JSON.stringify(newValue));
      }
      window.dispatchEvent(
        new CustomEvent(LOCAL_STORAGE_CHANGE, {
          detail: { key, newValue: newValue !== null ? JSON.stringify(newValue) : null },
        }),
      );
    },
    [key, initialValue],
  );

  return [value, setStoredValue] as const;
}
