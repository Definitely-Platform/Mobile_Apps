import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';

/**
 * Dynamically resolves the development host IP address.
 * On real physical devices running Expo Go, extracts the host LAN IP (e.g. 192.168.1.x)
 * from the Expo Metro bundler manifest so network calls reach your machine.
 */
function getHostAddress(): string {
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

  // Fallback to active development machine LAN IP for physical smartphone testing
  return '192.168.1.9';
}

const LOCAL_HOST = getHostAddress();
const useProdAuth = process.env.EXPO_PUBLIC_USE_PROD_AUTH === 'true';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || `http://${LOCAL_HOST}:8085`;

/**
 * Generates dynamic redirect URI:
 * In Expo Go: exp://<host>:8088/--/auth/callback
 * In standalone native build: definitelyone://auth/callback
 */
export function getRedirectUri(): string {
  try {
    const url = Linking.createURL('auth/callback');
    if (url) return url;
  } catch (err) {
    console.warn('[config] Linking.createURL failed, falling back to definitelyone://', err);
  }
  return 'definitelyone://auth/callback';
}

export const AUTH_CONFIG = {
  ACCOUNTS_URL:
    process.env.EXPO_PUBLIC_ACCOUNTS_URL ||
    (__DEV__ && !useProdAuth ? `http://${LOCAL_HOST}:5174` : 'https://accounts.definitely.live'),
  API_URL:
    process.env.EXPO_PUBLIC_AUTH_API_URL ||
    (__DEV__ && !useProdAuth ? `http://${LOCAL_HOST}:8081` : 'https://api.accounts.definitely.live'),
  get REDIRECT_URI() {
    return getRedirectUri();
  },
};
