let memoryStorage: Record<string, string> = {};

export const Storage = {
  set(key: string, value: string, options?: { cookie?: boolean; days?: number }) {
    if (typeof document !== "undefined" && options?.cookie) {
      const expires = options.days
        ? `; expires=${new Date(Date.now() + options.days * 864e5).toUTCString()}`
        : "";
      document.cookie = `${key}=${encodeURIComponent(value)}${expires}; path=/`;
    } else if (typeof localStorage !== "undefined") {
      localStorage.setItem(key, value);
    } else {
      memoryStorage[key] = value;
    }
  },

  get(key: string): string | null {
    if (typeof document !== "undefined" && document.cookie.includes(key)) {
      const match = document.cookie.match(new RegExp(`${key}=([^;]+)`));
      return match ? decodeURIComponent(match[1]) : null;
    }
    if (typeof localStorage !== "undefined") {
      return localStorage.getItem(key);
    }
    return memoryStorage[key] ?? null;
  },

  remove(key: string) {
    if (typeof document !== "undefined") {
      document.cookie = `${key}=; Max-Age=0; path=/`;
    }
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(key);
    }
    delete memoryStorage[key];
  },
};