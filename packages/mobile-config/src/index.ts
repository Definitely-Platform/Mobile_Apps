import Constants from 'expo-constants';
import * as Linking from 'expo-linking';

/**
 * Dynamically resolves the development machine's LAN IP address.
 * On real physical devices running Expo Go, extracts the host LAN IP (e.g. 192.168.1.x)
 * from the Expo Metro bundler manifest so network calls reach your machine.
 */
export function getHostAddress(fallbackIp = '192.168.1.9'): string {
  const candidates = [
    Constants.expoConfig?.hostUri,
    (Constants as any).expoGoConfig?.debuggerHost,
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost,
    (Constants as any).manifest?.debuggerHost,
    Constants.linkingUri,
    Constants.experienceUrl,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate) {
      const cleaned = candidate.replace(/^[a-z]+:\/\//i, '');
      const ip = cleaned.split('/')[0]?.split(':')[0];
      if (ip && ip !== 'localhost' && ip !== '127.0.0.1' && !ip.startsWith('10.0.2.2')) {
        return ip;
      }
    }
  }

  return fallbackIp;
}

/**
 * Generates dynamic redirect URI:
 * In Expo Go: exp://<host>:8088/--/auth/callback
 * In standalone native build: <scheme>://auth/callback
 */
export function getRedirectUri(fallbackScheme = 'definitelyone'): string {
  try {
    const url = Linking.createURL('auth/callback');
    if (url) return url;
  } catch (err) {
    console.warn('[config] Linking.createURL failed, falling back to custom scheme:', err);
  }
  return `${fallbackScheme}://auth/callback`;
}

export interface AppAuthConfigOptions {
  accountsUrl?: string;
  apiUrl?: string;
  fallbackScheme?: string;
  useProdAuth?: boolean;
}

export function createAuthConfig(options: AppAuthConfigOptions = {}) {
  const localHost = getHostAddress();
  const useProd = options.useProdAuth ?? (process.env.EXPO_PUBLIC_USE_PROD_AUTH === 'true');

  return {
    ACCOUNTS_URL:
      options.accountsUrl ||
      process.env.EXPO_PUBLIC_ACCOUNTS_URL ||
      (__DEV__ && !useProd ? `http://${localHost}:5174` : 'https://accounts.definitely.live'),
    API_URL:
      options.apiUrl ||
      process.env.EXPO_PUBLIC_AUTH_API_URL ||
      (__DEV__ && !useProd ? `http://${localHost}:8081` : 'https://api.accounts.definitely.live'),
    get REDIRECT_URI() {
      return getRedirectUri(options.fallbackScheme);
    },
  };
}
