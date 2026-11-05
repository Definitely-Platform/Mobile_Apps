import { create } from 'zustand';
import * as WebBrowser from 'expo-web-browser';
import { UserProfile, AuthTokens } from '@/types/auth';
import { SecureStorage } from '@/utils/secureStorage';
import { AUTH_CONFIG } from '@/api/config';

// Ensure WebBrowser completes auth session if running on web
WebBrowser.maybeCompleteAuthSession();

export interface AuthState {
  user: UserProfile | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLocked: boolean;
  biometricsEnabled: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  loginWithTokens: (
    accessToken: string,
    refreshToken?: string,
    userProfile?: UserProfile
  ) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshAuthSession: () => Promise<boolean>;
  restoreSession: () => Promise<boolean>;
  openSsoLogin: () => Promise<boolean>;
  startSsoPolling: (code: string) => void;
  stopSsoPolling: () => void;
  lock: () => void;
  unlock: () => void;
  setBiometricsEnabled: (enabled: boolean) => Promise<void>;
}

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'auth_access_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  USER: 'auth_user_profile',
  BIOMETRICS: 'auth_biometrics_enabled',
};

export const DEMO_USER: UserProfile = {
  id: 'usr_definitely_01',
  email: 'alex@definitelyone.com',
  name: 'Alex Rivera',
  avatarUrl:
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop',
  role: 'owner',
  organization: {
    id: 'org_main_01',
    name: 'Definitely One HQ',
    plan: 'enterprise',
  },
};

let pollInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Fetch fresh user profile from central auth-service API
 */
async function fetchUserProfile(token: string): Promise<UserProfile | null> {
  try {
    const res = await fetch(`${AUTH_CONFIG.API_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (data.success && data.user) {
      const raw = data.user;
      return {
        id: raw.id || raw.userId || raw._id,
        email: raw.email,
        name: raw.name || raw.email.split('@')[0],
        role: raw.role || 'member',
        avatarUrl: raw.avatarUrl,
        status: raw.status || 'active',
        tokenVersion: raw.tokenVersion,
        organization: raw.organization || {
          id: 'org_main_01',
          name: 'Definitely One HQ',
          plan: 'enterprise',
        },
      };
    }
    return null;
  } catch (err) {
    console.warn('[authStore] Failed to fetch user profile:', err);
    return null;
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLocked: false,
  biometricsEnabled: true,
  isLoading: true,
  error: null,

  loginWithTokens: async (accessToken, refreshToken, userProfile) => {
    set({ isLoading: true, error: null });

    try {
      await SecureStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      if (refreshToken) {
        await SecureStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      }

      let user = userProfile;
      if (!user) {
        user = (await fetchUserProfile(accessToken)) || undefined;
      }

      if (!user) {
        throw new Error('Unable to resolve user profile with access token');
      }

      await SecureStorage.setJSON(STORAGE_KEYS.USER, user);

      const tokens: AuthTokens = {
        accessToken,
        refreshToken: refreshToken || '',
      };

      set({
        user,
        tokens,
        isAuthenticated: true,
        isLocked: false,
        isLoading: false,
        error: null,
      });

      return true;
    } catch (err: any) {
      set({
        isLoading: false,
        isAuthenticated: false,
        error: err.message || 'Login failed',
      });
      return false;
    }
  },

  logout: async () => {
    const token = get().tokens?.accessToken;
    try {
      if (token) {
        await fetch(`${AUTH_CONFIG.API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {});
      }
    } finally {
      await SecureStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      await SecureStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      await SecureStorage.removeItem(STORAGE_KEYS.USER);

      set({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLocked: false,
        isLoading: false,
        error: null,
      });
    }
  },

  refreshAuthSession: async () => {
    const refreshToken = await SecureStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    if (!refreshToken) {
      await get().logout();
      return false;
    }

    try {
      const res = await fetch(`${AUTH_CONFIG.API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) {
        await get().logout();
        return false;
      }

      const data = await res.json();
      if (data.success && data.token) {
        const newAccessToken = data.token;
        const newRefreshToken = data.refreshToken || refreshToken;

        await SecureStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);
        await SecureStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);

        const user = (await fetchUserProfile(newAccessToken)) || get().user;
        if (user) {
          await SecureStorage.setJSON(STORAGE_KEYS.USER, user);
          set({
            tokens: { accessToken: newAccessToken, refreshToken: newRefreshToken },
            user,
            isAuthenticated: true,
          });
          return true;
        }
      }

      await get().logout();
      return false;
    } catch {
      return false;
    }
  },

  restoreSession: async () => {
    set({ isLoading: true });
    try {
      const [storedToken, storedRefreshToken, rawUser, rawBio] = await Promise.all([
        SecureStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
        SecureStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
        SecureStorage.getJSON<UserProfile | null>(STORAGE_KEYS.USER, null),
        SecureStorage.getItem(STORAGE_KEYS.BIOMETRICS),
      ]);

      const biometricsEnabled = rawBio !== 'false';

      if (!storedToken) {
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          isLoading: false,
        });
        return false;
      }

      // Optimistically set cached user to eliminate render flickers
      if (rawUser) {
        set({
          user: rawUser,
          tokens: { accessToken: storedToken, refreshToken: storedRefreshToken || '' },
          isAuthenticated: true,
          biometricsEnabled,
          isLocked: biometricsEnabled,
        });
      }

      // Background token verification
      const liveUser = await fetchUserProfile(storedToken);
      if (liveUser) {
        await SecureStorage.setJSON(STORAGE_KEYS.USER, liveUser);
        set({
          user: liveUser,
          tokens: { accessToken: storedToken, refreshToken: storedRefreshToken || '' },
          isAuthenticated: true,
          biometricsEnabled,
          isLoading: false,
        });
        return true;
      }

      // If token expired, attempt Refresh Token Rotation
      if (storedRefreshToken) {
        const refreshed = await get().refreshAuthSession();
        if (refreshed) {
          set({ isLoading: false });
          return true;
        }
      }

      await get().logout();
      return false;
    } catch {
      await get().logout();
      return false;
    }
  },

  startSsoPolling: (code: string) => {
    get().stopSsoPolling();

    pollInterval = setInterval(async () => {
      try {
        const res = await fetch(
          `${AUTH_CONFIG.API_URL}/api/auth/sso/poll?code=${encodeURIComponent(code)}`,
          { headers: { Accept: 'application/json' } }
        );
        if (!res.ok) return;

        const data = await res.json();
        if (data.success && data.token) {
          get().stopSsoPolling();
          WebBrowser.dismissAuthSession();
          await get().loginWithTokens(data.token, data.refreshToken, data.user);
        }
      } catch {
        // ignore network error
      }
    }, 1000);

    // Stop polling after 5 minutes
    setTimeout(() => {
      get().stopSsoPolling();
    }, 5 * 60 * 1000);
  },

  stopSsoPolling: () => {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
  },

  openSsoLogin: async () => {
    const ssoCode = Math.random().toString(36).substring(2) + Date.now().toString(36);
    get().startSsoPolling(ssoCode);

    const redirectUri = AUTH_CONFIG.REDIRECT_URI;
    const authUrl = `${AUTH_CONFIG.ACCOUNTS_URL}/login?redirect=${encodeURIComponent(redirectUri)}&platform=mobile&sso_code=${encodeURIComponent(ssoCode)}`;

    try {
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
      if (result.type === 'success' && result.url) {
        get().stopSsoPolling();

        let token: string | null = null;
        let refreshToken: string | null = null;

        try {
          const parsed = new URL(result.url);
          token = parsed.searchParams.get('token') || parsed.searchParams.get('sso_token');
          refreshToken =
            parsed.searchParams.get('refreshToken') || parsed.searchParams.get('refresh_token');

          if (!token && parsed.hash) {
            const hashParams = new URLSearchParams(parsed.hash.replace(/^#\/?/, ''));
            token = hashParams.get('token') || hashParams.get('sso_token');
            if (!refreshToken) {
              refreshToken =
                hashParams.get('refreshToken') || hashParams.get('refresh_token');
            }
          }
        } catch {
          // fallback query string regex parse
          const matchToken = result.url.match(/[?&#]token=([^&#]+)/);
          const matchSsoToken = result.url.match(/[?&#]sso_token=([^&#]+)/);
          const matchRefresh = result.url.match(/[?&#]refreshToken=([^&#]+)/);
          token = matchToken?.[1] ? decodeURIComponent(matchToken[1]) : (matchSsoToken?.[1] ? decodeURIComponent(matchSsoToken[1]) : null);
          refreshToken = matchRefresh?.[1] ? decodeURIComponent(matchRefresh[1]) : null;
        }

        if (token) {
          return await get().loginWithTokens(token, refreshToken || undefined);
        }
      }
    } catch (err) {
      console.warn('[authStore] openAuthSessionAsync error:', err);
    }

    return false;
  },

  lock: () => {
    if (get().isAuthenticated && get().biometricsEnabled) {
      set({ isLocked: true });
    }
  },

  unlock: () => {
    set({ isLocked: false });
  },

  setBiometricsEnabled: async (enabled) => {
    await SecureStorage.setItem(STORAGE_KEYS.BIOMETRICS, String(enabled));
    set({ biometricsEnabled: enabled });
  },
}));
