export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
export type RequestCredentials = "omit" | "same-origin" | "include";
export type ContentType = "application/json" | "application/x-www-form-urlencoded" | "multipart/form-data";

export type ApiOptions = {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  auth?: boolean;
  timeout?: number;
  credentials?: RequestCredentials;
  contentType?: ContentType;
};
