// Initialize Market Price Tracker
import { PriceTracker } from './js/services/priceTracker.js';
import { PriceGrid } from './js/components/PriceGrid.js';
import { formatDate } from './js/lib/utils/formatters.js';

let priceTracker = null;
let priceGrid = null;

async function initializePriceTracker() {
  try {
    // Get container elements
    const gridContainer = document.getElementById('price-grid');
    const refreshBtn = document.getElementById('refresh-prices-btn');
    const lastUpdateEl = document.getElementById('last-update');

    if (!gridContainer) {
      console.error('Price grid container not found');
      return;
    }

    // Initialize components
    priceGrid = new PriceGrid(gridContainer);
    priceTracker = new PriceTracker();

    // Subscribe to price updates
    priceTracker.subscribe((state) => {
      if (state.prices && state.prices.length > 0) {
        priceGrid.updateCards(state.prices);
      }

      if (state.lastUpdate) {
        if (lastUpdateEl) {
          const dateStr = state.lastUpdate instanceof Date 
            ? state.lastUpdate.toISOString() 
            : state.lastUpdate;
          lastUpdateEl.textContent = `Last updated: ${formatDate(dateStr)}`;
        }
      }

      // Update refresh button state
      if (refreshBtn) {
        refreshBtn.disabled = state.isLoading;
        const btnText = refreshBtn.querySelector('.btn-text');
        if (btnText) {
          btnText.textContent = state.isLoading ? 'Loading...' : 'Refresh Prices';
        } else {
          refreshBtn.textContent = state.isLoading ? 'Loading...' : 'Refresh Prices';
        }
      }
    });

    // Set up refresh button
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        priceTracker.updatePrices();
      });
    }

    // Initialize tracker
    await priceTracker.initialize();

    console.log('Price tracker initialized successfully');
  } catch (error) {
    console.error('Error initializing price tracker:', error);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePriceTracker);
} else {
  initializePriceTracker();
}