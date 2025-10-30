import { JwtStrategy } from "./strategies/jwt";
import { CookieStrategy } from "./strategies/cookie";

export type AuthType = "jwt" | "cookie";

let currentStrategy: AuthType = "jwt";

export const AuthManager = {
  use(type: AuthType) {
    currentStrategy = type;
  },

  get active() {
    return currentStrategy;
  },

  async login(endpoint: string, credentials: object) {
    switch (currentStrategy) {
      case "cookie":
        return CookieStrategy.login(endpoint, credentials);
      case "jwt":
      default:
        return JwtStrategy.login(endpoint, credentials);
    }
  },

  async logout(endpoint?: string) {
    if (currentStrategy === "cookie" && endpoint) {
      return CookieStrategy.logout(endpoint);
    }
    JwtStrategy.logout();
  },

  getAuthHeader() {
    if (currentStrategy === "jwt") return JwtStrategy.getAuthHeader();
    return {};
  },

  async verify(endpoint?: string) {
    if (currentStrategy === "cookie" && endpoint) {
      return CookieStrategy.verify(endpoint);
    }
    return null;
  },
};



// import { AuthManager } from "@yukemuri/auth";

// // --- JWT認証 ---
// AuthManager.use("jwt");
// await AuthManager.login("/auth/login", { email, password });
// const headers = AuthManager.getAuthHeader();

// // --- Cookie認証 ---
// AuthManager.use("cookie");
// await AuthManager.login("/auth/login", { email, password });
// await AuthManager.verify("/auth/me");