import { createAuthStore } from '@definitely/mobile-auth';

export const useAuthStore = createAuthStore({
  fallbackScheme: '{{APP_SCHEME}}',
});
