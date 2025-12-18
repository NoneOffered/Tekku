/**
 * Constants and configuration
 */

/**
 * All commodities to track
 * @type {string[]}
 */
export const COMMODITIES = [
  "Gold",
  "Silver",
  "Platinum",
  "Copper",
  "Lithium",
  "Nickel",
  "Cobalt",
  "Graphite",
  "Rare Earths",
  "Electricity",
  "Gas"
];

/**
 * Commodity categories
 * @type {Object<string, string[]>}
 */
export const COMMODITY_CATEGORIES = {
  "Precious Metals": ["Gold", "Silver", "Platinum"],
  "Base Metals": ["Copper", "Nickel"],
  "Battery Metals": ["Lithium", "Cobalt", "Graphite"],
  "Critical Minerals": ["Rare Earths"],
  "Energy": ["Electricity", "Gas"]
};

/**
 * API configuration
 */
export const API_CONFIG = {
  REFRESH_INTERVAL: 15 * 60 * 1000, // 15 minutes
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  REQUEST_TIMEOUT: 10000 // 10 seconds
};

/**
 * CORS proxy for web scraping (if needed)
 */
export const CORS_PROXY = "https://api.allorigins.win/raw?url=";


