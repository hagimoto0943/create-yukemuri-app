export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export type ApiOptions = {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  auth?: boolean;
  timeout?: number;
  credentials?: RequestCredentials;
};
