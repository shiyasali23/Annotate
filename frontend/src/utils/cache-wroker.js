// @/utils/cache-worker.js

const validCacheKeys = [


  "biochemicals",
  "foodNutrients",
  "nutrientsFoods",
  "foodsData",
  "nutrientsData",
  "foodNutriscoreData",

  "token",
  "userData",
  "healthScore",
  "biometrics",
  "latestBiometrics",
  "hyperBiochemicals",
  "hypoBiochemicals",
  "biometricsEntries",
];

class CacheManager {
  constructor(validKeys = []) {
    this.validKeys = new Set(validKeys);
  }

  // Check if a key is valid for caching.
  isValidKey(key) {
    return this.validKeys.has(key);
  }

  // Retrieve a single key from localStorage.
  get(key) {
    if (!this.isValidKey(key)) return null;
    if (typeof window === "undefined" || !window.localStorage) return null;
    const item = localStorage.getItem(key);
    if (!item) return null;
    try {
      return JSON.parse(item);
    } catch (error) {
      console.error(`Error parsing localStorage key "${key}":`, error);
      return null;
    }
  }

  // Set a single key in localStorage.
  set(key, value) {
    if (!this.isValidKey(key)) return;
    if (typeof window === "undefined" || !window.localStorage) return;
    localStorage.setItem(key, JSON.stringify(value));
  }

  // Retrieve multiple keys from localStorage at once.
  multiGet(keys) {
    const result = {};
    keys.forEach((key) => {
      result[key] = this.get(key);
    });
    return result;
  }

  // Set multiple keys in localStorage at once.
  multiSet(data) {
    Object.keys(data).forEach((key) => {
      if (this.isValidKey(key)) {
        this.set(key, data[key]);
      }
    });
  }

  // Remove a specific key from localStorage.
  clear(key) {
    if (!this.isValidKey(key)) return;
    if (typeof window === "undefined" || !window.localStorage) return;
    localStorage.removeItem(key);
  }

  // Clear all valid keys from localStorage.
  clearAll() {
    this.validKeys.forEach((key) => {
      this.clear(key);
    });
  }
}

export const cacheManager = new CacheManager(validCacheKeys);
