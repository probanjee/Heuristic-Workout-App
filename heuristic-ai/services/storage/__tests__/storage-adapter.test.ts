/**
 * HeuristicAI — Unit Tests: StorageAdapter
 */

import { storageAdapter, testStorage } from '../storage-adapter';

// Mock expo-secure-store for native testing inside storage adapter test
const mockSecureStoreState: Record<string, string> = {};
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockImplementation((key: string) => {
    return Promise.resolve(mockSecureStoreState[key] || null);
  }),
  setItemAsync: jest.fn().mockImplementation((key: string, value: string) => {
    mockSecureStoreState[key] = value.toString();
    return Promise.resolve();
  }),
  deleteItemAsync: jest.fn().mockImplementation((key: string) => {
    delete mockSecureStoreState[key];
    return Promise.resolve();
  }),
}));

describe('StorageAdapter', () => {
  beforeEach(() => {
    // Clear test storage (Jest env)
    for (const key of Object.keys(testStorage)) {
      delete testStorage[key];
    }
    // Clear mock native storage
    for (const key of Object.keys(mockSecureStoreState)) {
      delete mockSecureStoreState[key];
    }
    jest.clearAllMocks();
  });

  it('correctly sets, gets, and removes values in test environment', async () => {
    await storageAdapter.setItem('test_key', 'test_value');
    expect(testStorage['test_key']).toBe('test_value');

    const value = await storageAdapter.getItem('test_key');
    expect(value).toBe('test_value');

    await storageAdapter.removeItem('test_key');
    expect(testStorage['test_key']).toBeUndefined();

    const valueAfter = await storageAdapter.getItem('test_key');
    expect(valueAfter).toBeNull();
  });

  it('handles missing keys gracefully returning null', async () => {
    const value = await storageAdapter.getItem('missing_key');
    expect(value).toBeNull();
  });

  it('correctly stores and retrieves serialized JSON objects', async () => {
    const payload = { a: 1, b: 'test', c: [true, false] };
    await storageAdapter.setItem('json_key', JSON.stringify(payload));

    const retrieved = await storageAdapter.getItem('json_key');
    expect(retrieved).not.toBeNull();
    expect(JSON.parse(retrieved!)).toEqual(payload);
  });
});
