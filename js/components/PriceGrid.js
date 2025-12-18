/**
 * Price Grid Component
 * Container for price cards with responsive grid layout
 */

import { PriceCard } from './PriceCard.js';

/**
 * Price Grid Component Class
 */
export class PriceGrid {
  /**
   * @param {HTMLElement} container - Container element
   */
  constructor(container) {
    this.container = container;
    this.cards = new Map();
    this.render();
  }

  /**
   * Render the grid container
   */
  render() {
    this.container.className = 'price-grid';
    this.container.innerHTML = '';
  }

  /**
   * Add or update a price card
   * @param {Object} priceData - Price data
   */
  updateCard(priceData) {
    if (this.cards.has(priceData.commodity)) {
      // Update existing card
      const card = this.cards.get(priceData.commodity);
      card.update(priceData);
    } else {
      // Create new card
      const card = new PriceCard(this.container, priceData);
      this.cards.set(priceData.commodity, card);
    }
  }

  /**
   * Update multiple cards
   * @param {Object[]} pricesData - Array of price data
   */
  updateCards(pricesData) {
    pricesData.forEach(data => {
      this.updateCard(data);
    });
  }

  /**
   * Show loading state for all cards
   * @param {string[]} commodities - Array of commodity names
   */
  showLoading(commodities) {
    commodities.forEach(commodity => {
      if (this.cards.has(commodity)) {
        this.cards.get(commodity).showLoading();
      } else {
        // Create loading card
        const tempContainer = document.createElement('div');
        this.container.appendChild(tempContainer);
        const card = new PriceCard(tempContainer, {
          commodity,
          price: 0,
          unit: '',
          change: 0,
          changePercent: 0,
          lastUpdated: new Date().toISOString(),
          source: 'Loading...',
          isMockData: false
        });
        card.showLoading();
        this.cards.set(commodity, card);
      }
    });
  }

  /**
   * Clear all cards
   */
  clear() {
    this.cards.forEach(card => card.destroy());
    this.cards.clear();
    this.container.innerHTML = '';
  }
}


