import { getHostAddress, getRedirectUri, createAuthConfig } from '@definitely/mobile-config';

export { getHostAddress, getRedirectUri };

export const LOCAL_HOST = getHostAddress();
// Default to production cloud auth (accounts.definitely.live) unless explicitly set to 'false'
const useProdAuth = process.env.EXPO_PUBLIC_USE_PROD_AUTH !== 'false';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || `http://${LOCAL_HOST}:8085`;

export const AUTH_CONFIG = createAuthConfig({
  fallbackScheme: 'definitelyone',
  useProdAuth,
});
