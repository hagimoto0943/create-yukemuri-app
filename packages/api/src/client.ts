import { ApiOptions } from "./types";
import { AuthManager } from "@yukemuri/auth";

const DEFAULT_CREDENTIALS: RequestCredentials = "include";

export class YukemuriClient {
  constructor(private baseURL: string = "/api") {}

  private async request<T>(url: string, options: ApiOptions = {}): Promise<T> {
    const {
      method = "GET",
      headers = {},
      body,
      auth,
      timeout = 10000,
      credentials = DEFAULT_CREDENTIALS,
    } = options;

    const finalHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...headers,
    };

    // 認証トークン自動付与（今後authモジュール連携予定）
    if (auth) {
      const authHeader = AuthManager.getAuthHeader();
      Object.assign(finalHeaders, authHeader);
    }

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(`${this.baseURL}${url}`, {
      method,
      headers: finalHeaders,
      body: body ? JSON.stringify(body) : undefined,
      credentials,
      signal: controller.signal,
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
      return (await response.json()) as T;
    } catch {
      return undefined as T;
    }
  }

  get<T>(url: string, auth = false) {
    return this.request<T>(url, { method: "GET", auth });
  }

  post<T>(url: string, body?: unknown, auth = false) {
    return this.request<T>(url, { method: "POST", body, auth });
  }

  put<T>(url: string, body?: unknown, auth = false) {
    return this.request<T>(url, { method: "PUT", body, auth });
  }

  delete<T>(url: string, auth = false) {
    return this.request<T>(url, { method: "DELETE", auth });
  }
}

// export singleton instance
export const api = new YukemuriClient("/api");
