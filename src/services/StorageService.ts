/**
 * StorageService — Persistent key-value store using MMKV
 * 
 * MMKV is a high-performance key-value storage framework by WeChat.
 * It uses mmap for read/write, making it ~30x faster than AsyncStorage.
 * Data persists across app restarts and survives process death.
 */
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV({
  id: 'fieldguard-main-storage',
  encryptionKey: 'fieldguard-2024-secure-key', // Encrypts data at rest
});

export const StorageService = {
  // --- Raw Operations ---
  
  getString(key: string): string | undefined {
    return storage.getString(key);
  },

  setString(key: string, value: string): void {
    storage.set(key, value);
  },

  getNumber(key: string): number | undefined {
    return storage.getNumber(key);
  },

  setNumber(key: string, value: number): void {
    storage.set(key, value);
  },

  getBoolean(key: string): boolean | undefined {
    return storage.getBoolean(key);
  },

  setBoolean(key: string, value: boolean): void {
    storage.set(key, value);
  },

  delete(key: string): void {
    storage.delete(key);
  },

  contains(key: string): boolean {
    return storage.contains(key);
  },

  getAllKeys(): string[] {
    return storage.getAllKeys();
  },

  clearAll(): void {
    storage.clearAll();
  },

  // --- JSON Operations ---
  
  getJSON<T>(key: string): T | null {
    const raw = storage.getString(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  setJSON(key: string, value: any): void {
    storage.set(key, JSON.stringify(value));
  },

  // --- Array/Collection Operations ---
  
  appendToArray<T>(key: string, item: T): void {
    const existing = this.getJSON<T[]>(key) || [];
    existing.push(item);
    this.setJSON(key, existing);
  },

  removeFromArray<T>(key: string, predicate: (item: T) => boolean): void {
    const existing = this.getJSON<T[]>(key) || [];
    const filtered = existing.filter(item => !predicate(item));
    this.setJSON(key, filtered);
  },

  updateInArray<T>(key: string, predicate: (item: T) => boolean, updater: (item: T) => T): void {
    const existing = this.getJSON<T[]>(key) || [];
    const updated = existing.map(item => predicate(item) ? updater(item) : item);
    this.setJSON(key, updated);
  },
};

export default StorageService;
