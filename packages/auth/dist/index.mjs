// src/core/session.ts
var session = {};
var Session = {
  set(partial) {
    session = { ...session, ...partial };
  },
  get() {
    return session;
  },
  clear() {
    session = {};
  }
};

// src/core/storage.ts
var memoryStorage = {};
var Storage = {
  set(key, value, options) {
    if (typeof document !== "undefined" && (options == null ? void 0 : options.cookie)) {
      const expires = options.days ? `; expires=${new Date(Date.now() + options.days * 864e5).toUTCString()}` : "";
      document.cookie = `${key}=${encodeURIComponent(value)}${expires}; path=/`;
    } else if (typeof localStorage !== "undefined") {
      localStorage.setItem(key, value);
    } else {
      memoryStorage[key] = value;
    }
  },
  get(key) {
    if (typeof document !== "undefined" && document.cookie.includes(key)) {
      const match = document.cookie.match(new RegExp(`${key}=([^;]+)`));
      return match ? decodeURIComponent(match[1]) : null;
    }
    if (typeof localStorage !== "undefined") {
      return localStorage.getItem(key);
    }
    return memoryStorage[key] ?? null;
  },
  remove(key) {
    if (typeof document !== "undefined") {
      document.cookie = `${key}=; Max-Age=0; path=/`;
    }
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(key);
    }
    delete memoryStorage[key];
  }
};

// src/strategies/jwt.ts
var ACCESS_KEY = "access_token";
var REFRESH_KEY = "refresh_token";
var JwtStrategy = {
  async login(endpoint, credentials) {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials)
    });
    if (!res.ok) throw new Error("JWT login failed");
    const data = await res.json();
    Session.set({
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      user: data.user,
      expiresAt: data.expires_at ? Date.now() + data.expires_at * 1e3 : void 0
    });
    Storage.set(ACCESS_KEY, data.access_token);
    if (data.refresh_token) Storage.set(REFRESH_KEY, data.refresh_token);
    return data;
  },
  getAuthHeader() {
    const token = Storage.get(ACCESS_KEY);
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
  async refresh(refreshEndpoint) {
    const refresh = Storage.get(REFRESH_KEY);
    if (!refresh) return null;
    const res = await fetch(refreshEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh })
    });
    if (!res.ok) {
      Session.clear();
      Storage.remove(ACCESS_KEY);
      Storage.remove(REFRESH_KEY);
      return null;
    }
    const data = await res.json();
    Session.set({ accessToken: data.access_token, refreshToken: data.refresh_token });
    Storage.set(ACCESS_KEY, data.access_token);
    if (data.refresh_token) Storage.set(REFRESH_KEY, data.refresh_token);
    return data.access_token;
  },
  logout() {
    Session.clear();
    Storage.remove(ACCESS_KEY);
    Storage.remove(REFRESH_KEY);
  }
};

// src/strategies/cookie.ts
var CookieStrategy = {
  async login(endpoint, credentials) {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
      credentials: "include"
    });
    if (!res.ok) {
      throw new Error("Cookie login failed");
    }
    const data = await res.json();
    Session.set({ user: data.user ?? data });
    return data;
  },
  async logout(endpoint) {
    const res = await fetch(endpoint, {
      method: "POST",
      credentials: "include"
    });
    if (!res.ok) {
      console.warn("Logout request failed.");
    }
    Session.clear();
  },
  async verify(endpoint) {
    const res = await fetch(endpoint, {
      method: "GET",
      credentials: "include"
    });
    if (!res.ok) {
      Session.clear();
      return null;
    }
    const data = await res.json();
    Session.set({ user: data.user ?? data });
    return data;
  }
};

// src/manager.ts
var currentStrategy = "jwt";
var AuthManager = {
  use(type) {
    currentStrategy = type;
  },
  get active() {
    return currentStrategy;
  },
  async login(endpoint, credentials) {
    switch (currentStrategy) {
      case "cookie":
        return CookieStrategy.login(endpoint, credentials);
      case "jwt":
      default:
        return JwtStrategy.login(endpoint, credentials);
    }
  },
  async logout(endpoint) {
    if (currentStrategy === "cookie" && endpoint) {
      return CookieStrategy.logout(endpoint);
    }
    JwtStrategy.logout();
  },
  getAuthHeader() {
    if (currentStrategy === "jwt") return JwtStrategy.getAuthHeader();
    return {};
  },
  async verify(endpoint) {
    if (currentStrategy === "cookie" && endpoint) {
      return CookieStrategy.verify(endpoint);
    }
    return null;
  }
};
export {
  AuthManager,
  Session,
  Storage
};
