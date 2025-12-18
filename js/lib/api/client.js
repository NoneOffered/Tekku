/**
 * Main API Client
 * Orchestrates data fetching from multiple sources
 */

import { getExamplePrice } from '../../data/mockData.js';
import { getCachedPrice, setCachedPrice } from '../utils/cache.js';
import { normalizePriceData, validatePriceData } from '../utils/validators.js';
import { fetchGoldPrice as fetchGoldFromLBMA, fetchSilverPrice as fetchSilverFromLBMA, fetchPlatinumPrice as fetchPlatinumFromLBMA } from './lbma.js';
import { fetchCopperPrice, fetchGasPrice, fetchElectricityPrice } from './yahooFinance.js';
import { fetchGoldPrice as fetchGoldFromYahoo, fetchSilverPrice as fetchSilverFromYahoo, fetchPlatinumPrice as fetchPlatinumFromYahoo } from './yahooFinance.js';
import { fetchNickelPrice, fetchLithiumPrice, fetchCobaltPrice, fetchGraphitePrice, fetchRareEarthsPrice } from './metalPrices.js';
import { API_CONFIG } from '../constants.js';

/**
 * @typedef {Object} PriceData
 * @property {string} commodity
 * @property {number} price
 * @property {string} unit
 * @property {number} change
 * @property {number} changePercent
 * @property {string} lastUpdated
 * @property {string} source
 * @property {boolean} isMockData
 */

/**
 * Delay utility
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise<void>}
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch with retry logic
 * @param {Function} fn - Function to retry
 * @param {number} retries - Number of retry attempts
 * @returns {Promise<any>}
 */
async function fetchWithRetry(fn, retries = API_CONFIG.RETRY_ATTEMPTS) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await delay(API_CONFIG.RETRY_DELAY * (i + 1)); // Exponential backoff
    }
  }
}

/**
 * Fetch commodity price with fallback chain
 * @param {string} commodityName - Name of commodity
 * @returns {Promise<PriceData>}
 */
export async function fetchCommodityPrice(commodityName) {
  // Try to get from cache first
  const cached = getCachedPrice(commodityName);
  if (cached && validatePriceData(cached)) {
    return cached;
  }

  try {
    let priceData = null;

    // Route to appropriate API based on commodity
    switch (commodityName) {
      case "Gold":
        // Try LBMA first (official source), fallback to Yahoo Finance
        try {
          priceData = await fetchWithRetry(() => fetchGoldFromLBMA());
        } catch (error) {
          console.warn('LBMA failed for Gold, trying Yahoo Finance:', error);
          priceData = await fetchWithRetry(() => fetchGoldFromYahoo());
        }
        break;
      case "Silver":
        // Try LBMA first, fallback to Yahoo Finance
        try {
          priceData = await fetchWithRetry(() => fetchSilverFromLBMA());
        } catch (error) {
          console.warn('LBMA failed for Silver, trying Yahoo Finance:', error);
          priceData = await fetchWithRetry(() => fetchSilverFromYahoo());
        }
        break;
      case "Platinum":
        // Try LBMA first, fallback to Yahoo Finance
        try {
          priceData = await fetchWithRetry(() => fetchPlatinumFromLBMA());
        } catch (error) {
          console.warn('LBMA failed for Platinum, trying Yahoo Finance:', error);
          priceData = await fetchWithRetry(() => fetchPlatinumFromYahoo());
        }
        break;
      case "Copper":
        priceData = await fetchWithRetry(() => fetchCopperPrice());
        break;
      case "Gas":
        priceData = await fetchWithRetry(() => fetchGasPrice());
        break;
      case "Nickel":
        priceData = await fetchWithRetry(() => fetchNickelPrice());
        break;
      case "Lithium":
        priceData = await fetchWithRetry(() => fetchLithiumPrice());
        break;
      case "Cobalt":
        priceData = await fetchWithRetry(() => fetchCobaltPrice());
        break;
      case "Graphite":
        priceData = await fetchWithRetry(() => fetchGraphitePrice());
        break;
      case "Rare Earths":
        priceData = await fetchWithRetry(() => fetchRareEarthsPrice());
        break;
      case "Electricity":
        priceData = await fetchWithRetry(() => fetchElectricityPrice());
        break;
      default:
        throw new Error(`No API available for ${commodityName}`);
    }

    // Normalize and validate data
    const normalized = normalizePriceData(priceData);
    if (validatePriceData(normalized)) {
      // Cache the result
      setCachedPrice(commodityName, normalized);
      return normalized;
    } else {
      throw new Error('Invalid price data received');
    }
  } catch (error) {
    console.warn(`Failed to fetch ${commodityName}:`, error);
    console.error(`Error details:`, {
      message: error.message,
      stack: error.stack,
      commodity: commodityName
    });
    
    // Fallback to example data
    const exampleData = getExamplePrice(commodityName);
    console.log(`Using example data for ${commodityName} due to: ${error.message}`);
    return exampleData;
  }
}

/**
 * Batch fetch all commodity prices
 * @param {string[]} commodities - Array of commodity names
 * @returns {Promise<PriceData[]>}
 */
export async function fetchAllPrices(commodities) {
  // Fetch all prices in parallel
  const promises = commodities.map(commodity => 
    fetchCommodityPrice(commodity).catch(error => {
      console.error(`Error fetching ${commodity}:`, error);
      // Return example data on error
      return getExamplePrice(commodity);
    })
  );

  const results = await Promise.all(promises);
  return results.filter(Boolean); // Filter out any null/undefined results
}

/**
 * Handle API errors with fallback
 * @param {Error} error - Error object
 * @param {string} commodity - Commodity name
 * @returns {PriceData}
 */
export function handleApiError(error, commodity) {
  console.error(`API error for ${commodity}:`, error);
  return getExamplePrice(commodity);
}

