interface ImportMeta {
  readonly env: {
    readonly PUBLIC_API_URL?: string;
  };
}

declare const process:
  | {
      env?: Record<string, string | undefined>;
      versions?: {
        node?: string;
      };
      cwd?: () => string;
    }
  | undefined;

declare const require:
  | undefined
  | ((id: string) => any);

declare const module:
  | undefined
  | {
      require?: (id: string) => any;
    };
