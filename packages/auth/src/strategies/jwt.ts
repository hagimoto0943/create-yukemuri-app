import { Session } from "../core/session";
import { Storage } from "../core/storage";

const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

export const JwtStrategy = {
  async login(endpoint: string, credentials: Record<string, any>) {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    if (!res.ok) throw new Error("JWT login failed");

    const data = await res.json();
    Session.set({
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      user: data.user,
      expiresAt: data.expires_at ? Date.now() + data.expires_at * 1000 : undefined,
    });

    Storage.set(ACCESS_KEY, data.access_token);
    if (data.refresh_token) Storage.set(REFRESH_KEY, data.refresh_token);
    return data;
  },

  getAuthHeader() {
    const token = Storage.get(ACCESS_KEY);
    return token ? { Authorization: `Bearer ${token}` } : {};
  },

  async refresh(refreshEndpoint: string) {
    const refresh = Storage.get(REFRESH_KEY);
    if (!refresh) return null;

    const res = await fetch(refreshEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
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
  },
};

// import { JwtStrategy } from "@yukemuri/auth";

// await JwtStrategy.login("/auth/login", {
//   email: "test@example.com",
//   password: "password123",
// });

// const token = JwtStrategy.getAccessToken();
// const headers = JwtStrategy.getAuthHeader();

// console.log(token, headers);