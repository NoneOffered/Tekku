/**
 * Price Card Component
 * Formbricks-style component for displaying commodity prices
 */

import { formatPrice, formatChange, formatDate } from '../lib/utils/formatters.js';
import { isExampleData } from '../data/mockData.js';
import { createLineChart } from '../lib/utils/chart.js';

/**
 * Price Card Component Class
 */
export class PriceCard {
  /**
   * @param {HTMLElement} container - Container element
   * @param {Object} data - Price data
   */
  constructor(container, data) {
    this.container = container;
    this.data = data;
    this.element = null;
    this.render();
  }

  /**
   * Render the price card
   */
  render() {
    const card = document.createElement('div');
    card.className = 'price-card';
    card.setAttribute('data-commodity', this.data.commodity);

    const { text: changeText, colorClass: changeColorClass } = formatChange(
      this.data.change,
      this.data.changePercent
    );

    const isExample = isExampleData(this.data);
    
    // Generate or use historical data for chart
    const historicalData = this.data.historicalData || [];
    const chartSvg = historicalData.length > 0 
      ? createLineChart(historicalData, 280, 120)
      : '';

    card.innerHTML = `
      <div class="price-card-header">
        <h3 class="price-card-title">${this.data.commodity}</h3>
        ${isExample ? '<span class="price-card-badge">Example</span>' : ''}
      </div>
      <div class="price-card-body">
        <div class="price-card-price">${formatPrice(this.data.price, this.data.unit)}</div>
        <div class="price-card-change ${changeColorClass}">${changeText}</div>
      </div>
      <div class="price-card-chart">
        ${chartSvg}
        <div class="chart-label">24 Months</div>
      </div>
      <div class="price-card-footer">
        <span class="price-card-source">${this.data.source}</span>
        <span class="price-card-time">${formatDate(this.data.lastUpdated)}</span>
      </div>
    `;

    // Remove existing card if present
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }

    this.element = card;
    this.container.appendChild(card);
  }

  /**
   * Update card with new data
   * @param {Object} data - New price data
   */
  update(data) {
    this.data = data;
    
    // Smooth update with fade effect
    if (this.element) {
      this.element.style.opacity = '0.5';
      setTimeout(() => {
        this.render();
        this.element.style.opacity = '1';
        this.element.style.transition = 'opacity 0.3s ease';
      }, 150);
    } else {
      this.render();
    }
  }

  /**
   * Show loading state
   */
  showLoading() {
    if (this.element) {
      this.element.classList.add('loading');
      this.element.innerHTML = `
        <div class="price-card-skeleton">
          <div class="skeleton-line skeleton-title"></div>
          <div class="skeleton-line skeleton-price"></div>
          <div class="skeleton-line skeleton-change"></div>
        </div>
      `;
    }
  }

  /**
   * Show error state
   * @param {Error} error - Error object
   */
  showError(error) {
    if (this.element) {
      this.element.classList.add('error');
      this.element.innerHTML = `
        <div class="price-card-error">
          <p>Unable to load data</p>
          <button class="retry-btn" onclick="location.reload()">Retry</button>
        </div>
      `;
    }
  }

  /**
   * Remove card from DOM
   */
  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}

