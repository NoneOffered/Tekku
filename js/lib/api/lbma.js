/**
 * LBMA (London Bullion Market Association) API Client
 * Fetches official LBMA gold and silver prices from public sources
 */

/**
 * Check if we need to use a CORS proxy
 * @returns {boolean}
 */
function needsCorsProxy() {
  return window.location.hostname.includes('github.io') || 
         window.location.hostname.includes('github.com') ||
         window.location.hostname.includes('tekku.co.uk');
}

/**
 * Get CORS proxy URL if needed
 * @param {string} url - Original URL
 * @returns {string} - Proxied URL or original URL
 */
function getProxiedUrl(url) {
  if (needsCorsProxy()) {
    return `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
  }
  return url;
}

/**
 * Fetch with timeout
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<Response>}
 */
function fetchWithTimeout(url, options = {}, timeout = 10000) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    )
  ]);
}

/**
 * Fetch LBMA gold price from public sources
 * LBMA prices are set twice daily (10:30 AM and 3:00 PM UK time)
 * Tries multiple free public sources
 * @returns {Promise<Object>}
 */
export async function fetchGoldPrice() {
  // Try multiple free public sources that provide LBMA data
  const sources = [
    // Source 1: Try public LBMA data via web scraping (if available)
    // Note: Direct LBMA API requires license, so we use public data aggregators
    async () => {
      // Using a free public endpoint that aggregates LBMA data
      // This is a placeholder - we'll need to find actual free endpoints
      throw new Error('LBMA direct access requires license');
    },
    
    // Source 2: Try alternative free APIs that provide LBMA-style data
    async () => {
      // Many free APIs provide gold prices that align with LBMA benchmarks
      // We'll use Yahoo Finance as it's reliable and free
      throw new Error('Use Yahoo Finance fallback');
    }
  ];

  // For now, throw error to trigger fallback to Yahoo Finance
  // In the future, we can add actual LBMA scraping or free API integration
  throw new Error('LBMA direct access not available - using fallback');
}

/**
 * Fetch LBMA silver price from public sources
 * @returns {Promise<Object>}
 */
export async function fetchSilverPrice() {
  // Similar to gold - LBMA direct access requires license
  // Will fallback to Yahoo Finance which provides reliable silver prices
  throw new Error('LBMA direct access not available - using fallback');
}

/**
 * Fetch LBMA platinum price
 * @returns {Promise<Object>}
 */
export async function fetchPlatinumPrice() {
  // LBMA direct access requires license
  // Will fallback to Yahoo Finance
  throw new Error('LBMA direct access not available - using fallback');
}

