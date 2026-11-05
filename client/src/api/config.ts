import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Dynamically resolves the development host IP address.
 * On real physical devices running Expo Go, extracts the host LAN IP (e.g. 192.168.1.x)
 * from the Expo Metro bundler manifest so network calls reach your machine.
 */
function getHostAddress(): string {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost ||
    (Constants as any).manifest?.debuggerHost;

  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return ip;
    }
  }

  if (Platform.OS === 'android') {
    return '10.0.2.2';
  }

  return 'localhost';
}

const LOCAL_HOST = getHostAddress();

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || `http://${LOCAL_HOST}:8085`;

export const AUTH_CONFIG = {
  ACCOUNTS_URL:
    process.env.EXPO_PUBLIC_ACCOUNTS_URL ||
    (__DEV__ ? `http://${LOCAL_HOST}:5174` : 'https://accounts.definitely.live'),
  API_URL:
    process.env.EXPO_PUBLIC_AUTH_API_URL ||
    (__DEV__ ? `http://${LOCAL_HOST}:8081` : 'https://api.accounts.definitely.live'),
  REDIRECT_URI: 'definitelyone://auth/callback',
};
