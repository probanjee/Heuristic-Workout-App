/**
 * File: services/storage/storage-adapter.ts
 * Purpose: Platform-safe storage adapter using SecureStore on Native and localStorage on Web/Tests.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const isTest = typeof process !== 'undefined' && process.env.NODE_ENV === 'test';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const isWeb = typeof window !== 'undefined' || (!isTest && typeof require !== 'undefined' && require('react-native').Platform.OS === 'web');

const CHUNK_SIZE = 2000;

export const testStorage: Record<string, string> = {};

class StorageAdapter {
  public async getItem(key: string): Promise<string | null> {
    if (isWeb) {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      return null;
    }
    if (isTest) {
      return testStorage[key] || ((globalThis as any).secureStoreState?.[key]) || null;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const SecureStore = require('expo-secure-store');
      const meta = await SecureStore.getItemAsync(key);
      if (!meta) return null;

      if (meta.startsWith('__SPLIT__:')) {
        const count = parseInt(meta.split(':')[1], 10);
        let fullValue = '';
        for (let i = 0; i < count; i++) {
          const chunk = await SecureStore.getItemAsync(`${key}_split_${i}`);
          if (!chunk) return null;
          fullValue += chunk;
        }
        return fullValue;
      }
      return meta;
    } catch (e) {
      console.error('[StorageAdapter] Failed to getItemAsync:', e);
      return null;
    }
  }

  public async setItem(key: string, value: string): Promise<void> {
    if (isWeb) {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
      return;
    }
    if (isTest) {
      testStorage[key] = value;
      if (!(globalThis as any).secureStoreState) {
        (globalThis as any).secureStoreState = {};
      }
      (globalThis as any).secureStoreState[key] = value;
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const SecureStore = require('expo-secure-store');
      if (value.length <= CHUNK_SIZE) {
        await SecureStore.setItemAsync(key, value);
        // Clean up old split chunks if they existed
        let i = 0;
        while (true) {
          const splitKey = `${key}_split_${i}`;
          const exists = await SecureStore.getItemAsync(splitKey);
          if (!exists) break;
          await SecureStore.deleteItemAsync(splitKey);
          i++;
        }
        return;
      }

      // Split value into chunks
      let index = 0;
      for (let offset = 0; offset < value.length; offset += CHUNK_SIZE) {
        const chunk = value.slice(offset, offset + CHUNK_SIZE);
        await SecureStore.setItemAsync(`${key}_split_${index}`, chunk);
        index++;
      }
      await SecureStore.setItemAsync(key, `__SPLIT__:${index}`);
    } catch (e) {
      console.error('[StorageAdapter] Failed to setItemAsync:', e);
    }
  }

  public async removeItem(key: string): Promise<void> {
    if (isWeb) {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
      return;
    }
    if (isTest) {
      delete testStorage[key];
      if ((globalThis as any).secureStoreState) {
        delete (globalThis as any).secureStoreState[key];
      }
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const SecureStore = require('expo-secure-store');
      const meta = await SecureStore.getItemAsync(key);
      await SecureStore.deleteItemAsync(key);
      if (meta && meta.startsWith('__SPLIT__:')) {
        const count = parseInt(meta.split(':')[1], 10);
        for (let i = 0; i < count; i++) {
          await SecureStore.deleteItemAsync(`${key}_split_${i}`);
        }
      }
    } catch (e) {
      console.error('[StorageAdapter] Failed to deleteItemAsync:', e);
    }
  }
}

export const storageAdapter = new StorageAdapter();
export default storageAdapter;
