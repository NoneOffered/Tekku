/**
 * Price Tracker Service
 * Main orchestration layer for price tracking
 */

import { fetchAllPrices, fetchCommodityPrice } from '../lib/api/client.js';
import { getExamplePrice, getAllExamplePrices } from '../data/mockData.js';
import { getCachedPrice } from '../lib/utils/cache.js';
import { COMMODITIES, API_CONFIG } from '../lib/constants.js';

/**
 * Price Tracker Service Class
 */
export class PriceTracker {
  constructor() {
    this.state = {
      prices: new Map(),
      isLoading: false,
      lastUpdate: null,
      errors: new Map(),
      subscribers: []
    };
    this.refreshInterval = null;
  }

  /**
   * Initialize price tracking system
   * @returns {Promise<void>}
   */
  async initialize() {
    console.log('Initializing price tracker...');
    
    // Load initial data
    await this.updatePrices();
    
    // Set up auto-refresh
    this.startAutoRefresh();
  }

  /**
   * Update all prices
   * @returns {Promise<void>}
   */
  async updatePrices() {
    if (this.state.isLoading) {
      return; // Prevent concurrent updates
    }

    this.state.isLoading = true;
    this.notifySubscribers({ isLoading: true });

    try {
      // Fetch all prices
      const prices = await fetchAllPrices(COMMODITIES);
      
      // Update state
      prices.forEach(priceData => {
        this.state.prices.set(priceData.commodity, priceData);
      });

      // Ensure all commodities have data (use example if missing)
      this.ensureAllCommoditiesHaveData();

      this.state.lastUpdate = new Date();
      this.state.isLoading = false;

      // Notify subscribers
      this.notifySubscribers({
        prices: Array.from(this.state.prices.values()),
        lastUpdate: this.state.lastUpdate,
        isLoading: false
      });
    } catch (error) {
      console.error('Error updating prices:', error);
      this.state.isLoading = false;
      
      // Use example data as fallback
      const examplePrices = getAllExamplePrices();
      examplePrices.forEach(priceData => {
        this.state.prices.set(priceData.commodity, priceData);
      });

      this.notifySubscribers({
        prices: Array.from(this.state.prices.values()),
        isLoading: false,
        error: error.message
      });
    }
  }

  /**
   * Get price with fallback chain (real → cache → example)
   * @param {string} commodity - Commodity name
   * @returns {Object}
   */
  getPriceWithFallback(commodity) {
    // Try current state
    if (this.state.prices.has(commodity)) {
      return this.state.prices.get(commodity);
    }

    // Try cache
    const cached = getCachedPrice(commodity);
    if (cached) {
      return cached;
    }

    // Use example data
    return getExamplePrice(commodity);
  }

  /**
   * Ensure all commodities have data (use example if needed)
   */
  ensureAllCommoditiesHaveData() {
    COMMODITIES.forEach(commodity => {
      if (!this.state.prices.has(commodity)) {
        const exampleData = getExamplePrice(commodity);
        this.state.prices.set(commodity, exampleData);
      }
    });
  }

  /**
   * Subscribe to price updates
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    this.state.subscribers.push(callback);
    
    // Immediately call with current state
    callback({
      prices: Array.from(this.state.prices.values()),
      isLoading: this.state.isLoading,
      lastUpdate: this.state.lastUpdate
    });

    // Return unsubscribe function
    return () => {
      this.state.subscribers = this.state.subscribers.filter(cb => cb !== callback);
    };
  }

  /**
   * Notify all subscribers
   * @param {Object} data - Data to notify
   */
  notifySubscribers(data) {
    this.state.subscribers.forEach(callback => {
      try {
        callback({
          ...this.state,
          ...data
        });
      } catch (error) {
        console.error('Error in subscriber callback:', error);
      }
    });
  }

  /**
   * Start auto-refresh timer
   */
  startAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    this.refreshInterval = setInterval(() => {
      this.updatePrices();
    }, API_CONFIG.REFRESH_INTERVAL);
  }

  /**
   * Stop auto-refresh
   */
  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  /**
   * Get current state
   * @returns {Object}
   */
  getState() {
    return {
      prices: Array.from(this.state.prices.values()),
      isLoading: this.state.isLoading,
      lastUpdate: this.state.lastUpdate,
      errors: Array.from(this.state.errors.entries())
    };
  }
}

