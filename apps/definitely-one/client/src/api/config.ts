import { getHostAddress, getRedirectUri, createAuthConfig } from '@definitely/mobile-config';

export { getHostAddress, getRedirectUri };

export const LOCAL_HOST = getHostAddress();
const useProdAuth = process.env.EXPO_PUBLIC_USE_PROD_AUTH === 'true';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || `http://${LOCAL_HOST}:8085`;

export const AUTH_CONFIG = createAuthConfig({
  fallbackScheme: 'definitelyone',
  useProdAuth,
});
