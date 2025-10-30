interface ImportMeta {
  readonly env: {
    readonly PUBLIC_API_URL?: string;
  };
}

declare const process:
  | {
      env?: Record<string, string | undefined>;
    }
  | undefined;
