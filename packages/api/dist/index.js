var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  YukemuriClient: () => YukemuriClient,
  api: () => api
});
module.exports = __toCommonJS(index_exports);

// src/client.ts
var import_meta = {};
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
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      if (token) finalHeaders["Authorization"] = `Bearer ${token}`;
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
var _a;
var api = new YukemuriClient(((_a = import_meta.env) == null ? void 0 : _a.PUBLIC_API_URL) ?? "/api");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  YukemuriClient,
  api
});
