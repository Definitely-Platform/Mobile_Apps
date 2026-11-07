import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export const SecureStorage = {
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem(`_definitely_one_${key}`, value);
      } catch (e) {
        console.warn('Web storage write failed', e);
      }
      return;
    }

    try {
      await SecureStore.setItemAsync(key, value, {
        keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
      });
    } catch (e) {
      console.error(`Error saving secure key: ${key}`, e);
    }
  },

  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      try {
        return localStorage.getItem(`_definitely_one_${key}`);
      } catch (e) {
        return null;
      }
    }

    try {
      return await SecureStore.getItemAsync(key);
    } catch (e) {
      console.error(`Error reading secure key: ${key}`, e);
      return null;
    }
  },

  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        localStorage.removeItem(`_definitely_one_${key}`);
      } catch (e) {
        console.warn('Web storage delete failed', e);
      }
      return;
    }

    try {
      await SecureStore.deleteItemAsync(key);
    } catch (e) {
      console.error(`Error deleting secure key: ${key}`, e);
    }
  },

  async getJSON<T>(key: string, fallback: T): Promise<T> {
    const raw = await SecureStorage.getItem(key);
    if (!raw) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },

  async setJSON<T>(key: string, value: T): Promise<void> {
    await SecureStorage.setItem(key, JSON.stringify(value));
  },
};
