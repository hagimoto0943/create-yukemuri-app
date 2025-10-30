export interface SessionState {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  user?: Record<string, unknown>;
}

let session: SessionState = {};

export const Session = {
  set(partial: Partial<SessionState>) {
    session = { ...session, ...partial };
  },

  get(): SessionState {
    return session;
  },

  clear() {
    session = {};
  },
};