import * as SecureStore from 'expo-secure-store';

export const STORAGE_KEYS = {
  TOKEN: 'definitely_auth_token',
  REFRESH_TOKEN: 'definitely_refresh_token',
  USER: 'definitely_user_data',
  BIOMETRICS: 'definitely_biometrics_enabled',
} as const;

export const SecureStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
    } catch (err) {
      console.warn('[SecureStorage] Failed to set item:', err);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (err) {
      console.warn('[SecureStorage] Failed to delete item:', err);
    }
  },
};
