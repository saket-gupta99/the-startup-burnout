export function safeGetItem(key: string): string | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function safeSetItem(key: string, value: string) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage?.setItem(key, value);
  } catch {
    // ignore
  }
}

export function safeRemoveItem(key: string) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage?.removeItem(key);
  } catch {
    // ignore
  }
}
