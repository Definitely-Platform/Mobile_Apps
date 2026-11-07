export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: string;
  avatarUrl?: string;
  status: string;
  tokenVersion?: number;
  organization?: {
    id: string;
    name: string;
    plan: string;
  };
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLocked: boolean;
  biometricsEnabled: boolean;
  biometricsAvailable: boolean;

  // Actions
  initialize: () => Promise<void>;
  loginWithTokens: (token: string, refreshToken?: string, initialUser?: AuthUser) => Promise<boolean>;
  logout: () => Promise<void>;
  openSsoLogin: () => Promise<boolean>;
  openSsoRegister: () => Promise<boolean>;
  lock: () => void;
  unlock: () => void;
  unlockWithBiometrics: () => Promise<boolean>;
  setBiometricsEnabled: (enabled: boolean) => Promise<void>;
  startSsoPolling: (code: string) => void;
  stopSsoPolling: () => void;
}
