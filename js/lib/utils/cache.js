/**
 * LocalStorage cache management for price data
 */

const CACHE_PREFIX = 'tekku_prices_';
const CACHE_EXPIRY = 15 * 60 * 1000; // 15 minutes

/**
 * Get cached price data for a commodity
 * @param {string} commodity - Commodity name
 * @returns {Object|null}
 */
export function getCachedPrice(commodity) {
  try {
    const cached = localStorage.getItem(`${CACHE_PREFIX}${commodity}`);
    if (!cached) return null;

    const data = JSON.parse(cached);
    const now = Date.now();

    // Check if cache is expired
    if (now - data.timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(`${CACHE_PREFIX}${commodity}`);
      return null;
    }

    return data.priceData;
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
}

/**
 * Cache price data for a commodity
 * @param {string} commodity - Commodity name
 * @param {Object} priceData - Price data to cache
 */
export function setCachedPrice(commodity, priceData) {
  try {
    const cacheData = {
      priceData,
      timestamp: Date.now()
    };
    localStorage.setItem(`${CACHE_PREFIX}${commodity}`, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error writing cache:', error);
    // Handle quota exceeded error gracefully
  }
}

/**
 * Clear all cached price data
 */
export function clearCache() {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}

/**
 * Get all cached prices
 * @returns {Object<string, Object>}
 */
export function getAllCachedPrices() {
  const cached = {};
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        const commodity = key.replace(CACHE_PREFIX, '');
        const priceData = getCachedPrice(commodity);
        if (priceData) {
          cached[commodity] = priceData;
        }
      }
    });
  } catch (error) {
    console.error('Error getting all cached prices:', error);
  }
  return cached;
}

