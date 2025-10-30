// src/client.ts
import { AuthManager } from "@yukemuri/auth";
var YukemuriClient = class {
  constructor(baseURL = "/api") {
    this.baseURL = baseURL;
  }
  async request(url, options = {}) {
    const { method = "GET", headers = {}, body, auth, timeout = 1e4 } = options;
    const finalHeaders = {
      "Content-Type": "application/json",
      ...headers
    };
    if (auth) {
      const authHeader = AuthManager.getAuthHeader();
      Object.assign(finalHeaders, authHeader);
    }
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(`${this.baseURL}${url}`, {
      method,
      headers: finalHeaders,
      body: body ? JSON.stringify(body) : void 0,
      credentials: "include",
      signal: controller.signal
    }).finally(() => clearTimeout(id));
    if (!response.ok) {
      let message = `HTTP ${response.status}`;
      try {
        const errData = await response.json();
        message += `: ${errData.message || JSON.stringify(errData)}`;
      } catch (_) {
        message += `: ${await response.text()}`;
      }
      throw new Error(message);
    }
    try {
      return await response.json();
    } catch {
      return void 0;
    }
  }
  get(url, auth = false) {
    return this.request(url, { method: "GET", auth });
  }
  post(url, body, auth = false) {
    return this.request(url, { method: "POST", body, auth });
  }
  put(url, body, auth = false) {
    return this.request(url, { method: "PUT", body, auth });
  }
  delete(url, auth = false) {
    return this.request(url, { method: "DELETE", auth });
  }
};
function resolveBaseURL() {
  try {
    const meta = import.meta;
    if (meta?.env?.PUBLIC_API_URL) {
      return meta.env.PUBLIC_API_URL;
    }
  } catch {
  }
  if (typeof process !== "undefined" && process.env?.PUBLIC_API_URL) {
    return process.env.PUBLIC_API_URL;
  }
  return "/api";
}
var api = new YukemuriClient(resolveBaseURL());
export {
  YukemuriClient,
  api
};
