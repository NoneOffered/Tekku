/**
 * Data validation utilities
 */

/**
 * Validate price data structure
 * @param {Object} data - Data to validate
 * @returns {boolean}
 */
export function validatePriceData(data) {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const required = ['commodity', 'price', 'unit'];
  for (const field of required) {
    if (!(field in data)) {
      return false;
    }
  }

  return isValidPrice(data.price);
}

/**
 * Check if price is a valid number
 * @param {*} price - Price value to validate
 * @returns {boolean}
 */
export function isValidPrice(price) {
  return typeof price === 'number' && !isNaN(price) && isFinite(price) && price >= 0;
}

/**
 * Sanitize commodity name
 * @param {string} name - Commodity name
 * @returns {string}
 */
export function sanitizeCommodityName(name) {
  if (typeof name !== 'string') {
    return '';
  }
  return name.trim().replace(/[^a-zA-Z0-9\s]/g, '');
}

/**
 * Normalize price data structure
 * @param {Object} data - Raw price data
 * @returns {Object}
 */
export function normalizePriceData(data) {
  if (!data) {
    return null;
  }

  return {
    commodity: sanitizeCommodityName(data.commodity || ''),
    price: parseFloat(data.price) || 0,
    unit: data.unit || 'USD',
    change: parseFloat(data.change) || 0,
    changePercent: parseFloat(data.changePercent) || 0,
    lastUpdated: data.lastUpdated || new Date().toISOString(),
    source: data.source || 'Unknown',
    isMockData: data.isMockData || false,
    historicalData: data.historicalData || []
  };
}

