// In-memory cache object for fast access (data is also persisted in localStorage)
const inMemoryCache = {
  token: null,
  userdata: null,
  healthScore: null,
  biometrics: null,
  latestBiometrics: null,
  hyperBiochemicals: null,
  hypoBiochemicals: null,
  biometricsEntries: null,
  biochemicals: null,
};

// Ensure localStorage is accessed only on the client side
if (typeof window !== "undefined" && window.localStorage) {
  // Load cached data from localStorage on startup
  for (const key in inMemoryCache) {
    const value = localStorage.getItem(key);
    if (value !== null) {
      try {
        inMemoryCache[key] = JSON.parse(value);
      } catch (error) {
        console.error(`Error parsing localStorage key ${key}:`, error);
      }
    }
  }
}

/**
 * processCacheData - Retrieves and updates the cache (both in-memory & localStorage)
 */
export const processCacheData = ({
  token = null,
  healthScore = null,
  biometrics = null,
  latestBiometrics = null,
  hyperBiochemicals = null,
  hypoBiochemicals = null,
  userdata = null,
  biometricsEntries = null,
  biochemicals = null,
} = {}) => {
  const updatedCache = {
    token: token || inMemoryCache.token,
    userdata: userdata || inMemoryCache.userdata,
    healthScore: healthScore || inMemoryCache.healthScore,
    biometrics: biometrics || inMemoryCache.biometrics,
    latestBiometrics: latestBiometrics || inMemoryCache.latestBiometrics,
    hyperBiochemicals: hyperBiochemicals || inMemoryCache.hyperBiochemicals,
    hypoBiochemicals: hypoBiochemicals || inMemoryCache.hypoBiochemicals,
    biometricsEntries: biometricsEntries || inMemoryCache.biometricsEntries,
    biochemicals: biochemicals || inMemoryCache.biochemicals,
  };

  // Update in-memory cache
  Object.assign(inMemoryCache, updatedCache);

  // Persist updated values in localStorage if available
  if (typeof window !== "undefined" && window.localStorage) {
    for (const key in updatedCache) {
      localStorage.setItem(key, JSON.stringify(updatedCache[key]));
    }
  }

  return {
    isLogined: !!updatedCache.token,
    localToken: updatedCache.token || null,
    localUserData: updatedCache.userdata || null,
    localHealthScore: updatedCache.healthScore || null,
    localBiometrics: updatedCache.biometrics || null,
    localLatestBiometrics: updatedCache.latestBiometrics || null,
    localHyperBiochemicals: updatedCache.hyperBiochemicals || null,
    localHypoBiochemicals: updatedCache.hypoBiochemicals || null,
    localBiometricsEntries: updatedCache.biometricsEntries || null,
    localBiochemicals: updatedCache.biochemicals || null,
  };
};

/**
 * handleCacheLogout - Clears the in-memory cache and localStorage storage.
 */
export const handleCacheLogout = () => {
  // Clear in-memory cache
  for (const key in inMemoryCache) {
    inMemoryCache[key] = null;
  }
  // Clear localStorage if available
  if (typeof window !== "undefined" && window.localStorage) {
    for (const key in inMemoryCache) {
      localStorage.removeItem(key);
    }
  }
};
