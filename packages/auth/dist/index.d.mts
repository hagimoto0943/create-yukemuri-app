type AuthType = "jwt" | "cookie";
declare const AuthManager: {
    use(type: AuthType): void;
    readonly active: AuthType;
    login(endpoint: string, credentials: object): Promise<any>;
    logout(endpoint?: string): Promise<void>;
    getAuthHeader(): {
        Authorization: string;
    } | {
        Authorization?: undefined;
    };
    verify(endpoint?: string): Promise<any>;
};

interface SessionState {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    user?: Record<string, unknown>;
}
declare const Session: {
    set(partial: Partial<SessionState>): void;
    get(): SessionState;
    clear(): void;
};

declare const Storage: {
    set(key: string, value: string, options?: {
        cookie?: boolean;
        days?: number;
    }): void;
    get(key: string): string | null;
    remove(key: string): void;
};

export { AuthManager, type AuthType, Session, type SessionState, Storage };
