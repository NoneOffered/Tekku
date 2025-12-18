/**
 * Utility functions for formatting prices, dates, and currency
 */

/**
 * Format price with proper decimals and currency symbol
 * @param {number} price - Price value
 * @param {string} unit - Unit (e.g., "USD/oz", "USD/metric ton")
 * @returns {string}
 */
export function formatPrice(price, unit) {
  if (price === null || price === undefined || isNaN(price)) {
    return "N/A";
  }

  // Determine decimal places based on price magnitude
  let decimals = 2;
  if (price >= 1000) {
    decimals = 0;
  } else if (price >= 100) {
    decimals = 1;
  } else if (price >= 1) {
    decimals = 2;
  } else {
    decimals = 3;
  }

  // Format number with commas
  const formatted = price.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });

  return `${formatted} ${unit}`;
}

/**
 * Format price change with +/- and color indication
 * @param {number} change - Price change value
 * @param {number} changePercent - Percentage change
 * @returns {Object} Object with formatted text and color class
 */
export function formatChange(change, changePercent) {
  if (change === null || change === undefined || isNaN(change)) {
    return { text: "N/A", colorClass: "text-neutral" };
  }

  const sign = change >= 0 ? "+" : "";
  const formattedChange = change.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  const formattedPercent = Math.abs(changePercent).toFixed(2);

  const text = `${sign}${formattedChange} (${sign}${formattedPercent}%)`;
  const colorClass = change > 0 ? "text-success" : change < 0 ? "text-danger" : "text-neutral";

  return { text, colorClass };
}

/**
 * Format date/timestamp to readable format
 * @param {string} dateString - ISO date string
 * @returns {string}
 */
export function formatDate(dateString) {
  if (!dateString) return "Unknown";

  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) {
      return "Just now";
    } else if (diffMins < 60) {
      return `${diffMins} min ago`;
    } else if (diffMins < 1440) {
      const hours = Math.floor(diffMins / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  } catch (error) {
    return "Unknown";
  }
}

/**
 * Format currency amount
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: "USD")
 * @returns {string}
 */
export function formatCurrency(amount, currency = "USD") {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "N/A";
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}


