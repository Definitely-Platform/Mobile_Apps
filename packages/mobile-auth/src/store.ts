import { create } from 'zustand';
import * as WebBrowser from 'expo-web-browser';
import { SecureStorage, STORAGE_KEYS } from './storage';
import { BiometricsService } from './biometrics';
import type { AuthState, AuthUser } from './types';
import { createAuthConfig, type AppAuthConfigOptions } from '@definitely/mobile-config';

let pollInterval: ReturnType<typeof setInterval> | null = null;

export function createAuthStore(configOptions: AppAuthConfigOptions = {}) {
  const authConfig = createAuthConfig(configOptions);

  async function fetchUserProfile(token: string): Promise<AuthUser | null> {
    try {
      const res = await fetch(`${authConfig.API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
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

  async function triggerSsoFlow(mode: 'login' | 'signup', store: AuthState): Promise<boolean> {
    const ssoCode = Math.random().toString(36).substring(2) + Date.now().toString(36);
    store.startSsoPolling(ssoCode);

    const redirectUri = authConfig.REDIRECT_URI;
    const targetPath = mode === 'signup' ? '/signup' : '/login';
    const authUrl = `${authConfig.ACCOUNTS_URL}${targetPath}?redirect=${encodeURIComponent(
      redirectUri
    )}&platform=mobile&sso_code=${encodeURIComponent(ssoCode)}`;

    try {
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
      if (result.type === 'success' && result.url) {
        store.stopSsoPolling();

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
          const matchToken = result.url.match(/[?&#]token=([^&#]+)/);
          const matchSsoToken = result.url.match(/[?&#]sso_token=([^&#]+)/);
          const matchRefresh = result.url.match(/[?&#]refreshToken=([^&#]+)/);
          token = matchToken?.[1]
            ? decodeURIComponent(matchToken[1])
            : matchSsoToken?.[1]
            ? decodeURIComponent(matchSsoToken[1])
            : null;
          refreshToken = matchRefresh?.[1] ? decodeURIComponent(matchRefresh[1]) : null;
        }

        if (token) {
          return await store.loginWithTokens(token, refreshToken || undefined);
        }
      } else {
        setTimeout(() => {
          if (!store.isAuthenticated) {
            store.stopSsoPolling();
          }
        }, 8000);
      }
    } catch (err) {
      console.warn('[authStore] openAuthSessionAsync error:', err);
      setTimeout(() => {
        if (!store.isAuthenticated) {
          store.stopSsoPolling();
        }
      }, 8000);
    }

    return false;
  }

  return create<AuthState>((set, get) => ({
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,
    isLocked: false,
    biometricsEnabled: false,
    biometricsAvailable: false,

    initialize: async () => {
      try {
        set({ isLoading: true });

        const biometricsAvailable = await BiometricsService.isHardwareAvailable();
        const biometricsSetting = await SecureStorage.getItem(STORAGE_KEYS.BIOMETRICS);
        const biometricsEnabled = biometricsSetting === 'true';

        const token = await SecureStorage.getItem(STORAGE_KEYS.TOKEN);
        const refreshToken = await SecureStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        const userJson = await SecureStorage.getItem(STORAGE_KEYS.USER);

        if (token) {
          let user: AuthUser | null = null;
          if (userJson) {
            try {
              user = JSON.parse(userJson);
            } catch {
              user = null;
            }
          }

          if (!user) {
            user = await fetchUserProfile(token);
          }

          if (user) {
            set({
              token,
              refreshToken,
              user,
              isAuthenticated: true,
              isLocked: biometricsEnabled,
              biometricsAvailable,
              biometricsEnabled,
              isLoading: false,
            });
            return;
          }
        }

        set({
          token: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
          isLocked: false,
          biometricsAvailable,
          biometricsEnabled,
          isLoading: false,
        });
      } catch (err) {
        console.warn('[authStore] Init error:', err);
        set({ isLoading: false });
      }
    },

    loginWithTokens: async (token: string, refreshToken?: string, initialUser?: AuthUser) => {
      try {
        set({ isLoading: true });
        await SecureStorage.setItem(STORAGE_KEYS.TOKEN, token);
        if (refreshToken) {
          await SecureStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        }

        const user = initialUser || (await fetchUserProfile(token));
        if (user) {
          await SecureStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
          set({
            token,
            refreshToken: refreshToken || null,
            user,
            isAuthenticated: true,
            isLocked: false,
            isLoading: false,
          });
          return true;
        }

        set({ isLoading: false });
        return false;
      } catch (err) {
        console.warn('[authStore] Login error:', err);
        set({ isLoading: false });
        return false;
      }
    },

    logout: async () => {
      try {
        get().stopSsoPolling();
        await SecureStorage.removeItem(STORAGE_KEYS.TOKEN);
        await SecureStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        await SecureStorage.removeItem(STORAGE_KEYS.USER);

        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLocked: false,
        });
      } catch (err) {
        console.warn('[authStore] Logout error:', err);
      }
    },

    startSsoPolling: (code: string) => {
      if (pollInterval) clearInterval(pollInterval);

      pollInterval = setInterval(async () => {
        try {
          const res = await fetch(
            `${authConfig.API_URL}/api/auth/sso/poll?code=${encodeURIComponent(code)}`,
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
          // ignore
        }
      }, 1000);

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
      return triggerSsoFlow('login', get());
    },

    openSsoRegister: async () => {
      return triggerSsoFlow('signup', get());
    },

    lock: () => {
      if (get().isAuthenticated && get().biometricsEnabled) {
        set({ isLocked: true });
      }
    },

    unlock: () => {
      set({ isLocked: false });
    },

    unlockWithBiometrics: async () => {
      const ok = await BiometricsService.authenticate();
      if (ok) {
        set({ isLocked: false });
        return true;
      }
      return false;
    },

    setBiometricsEnabled: async (enabled: boolean) => {
      await SecureStorage.setItem(STORAGE_KEYS.BIOMETRICS, String(enabled));
      set({ biometricsEnabled: enabled });
    },
  }));
}
