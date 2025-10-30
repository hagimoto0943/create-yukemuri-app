import { Session } from "../core/session";

export const CookieStrategy = {
  async login(endpoint: string, credentials: object) {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error("Cookie login failed");
    }

    const data = await res.json();

    Session.set({ user: data.user ?? data });
    return data;
  },

  async logout(endpoint: string) {
    const res = await fetch(endpoint, {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) {
      console.warn("Logout request failed.");
    }

    Session.clear();
  },

  async verify(endpoint: string) {
    const res = await fetch(endpoint, {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) {
      Session.clear();
      return null;
    }

    const data = await res.json();
    Session.set({ user: data.user ?? data });
    return data;
  },
};

// import { CookieStrategy } from "@yukemuri/auth";

// // ログイン
// await CookieStrategy.login("/auth/login", { email, password });

// // セッション確認
// const user = await CookieStrategy.verify("/auth/me");

// // ログアウト
// await CookieStrategy.logout("/auth/logout");
