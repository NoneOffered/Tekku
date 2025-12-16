/**
 * Simple SVG Chart Utility
 * Creates 24-month price charts without external dependencies
 */

/**
 * Generate 24 months of historical data points for chart
 * @param {number} currentPrice - Current price
 * @param {number} volatility - Price volatility factor (0-1)
 * @returns {Array<{date: string, price: number}>}
 */
export function generateChartData(currentPrice, volatility = 0.15) {
  const data = [];
  const now = new Date();
  
  // Generate 24 months of data going backwards
  for (let i = 23; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    
    // Calculate price with some variation
    // Start from a base price and trend toward current price
    const monthsAgo = i;
    const trendFactor = monthsAgo / 23; // 0 to 1
    const basePrice = currentPrice * (1 - volatility * (1 - trendFactor));
    
    // Add random variation
    const variation = (Math.random() - 0.5) * volatility * 0.3;
    const price = basePrice * (1 + variation);
    
    data.push({
      date: date.toISOString(),
      price: Math.max(price, currentPrice * 0.5) // Ensure price doesn't go too low
    });
  }
  
  return data;
}

/**
 * Create SVG line chart
 * @param {Array<{date: string, price: number}>} data - Historical price data
 * @param {number} width - Chart width
 * @param {number} height - Chart height
 * @param {string} color - Line color
 * @returns {string} SVG string
 */
export function createLineChart(data, width = 280, height = 120, color = '#6366f1') {
  if (!data || data.length === 0) {
    return '<svg width="280" height="120"></svg>';
  }

  const padding = { top: 10, right: 10, bottom: 20, left: 10 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Find min and max prices
  const prices = data.map(d => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1; // Avoid division by zero

  // Calculate points
  const points = data.map((point, index) => {
    const x = padding.left + (index / (data.length - 1)) * chartWidth;
    const y = padding.top + chartHeight - ((point.price - minPrice) / priceRange) * chartHeight;
    return { x, y, price: point.price };
  });

  // Create path string
  const pathData = points.map((point, index) => {
    return `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
  }).join(' ');

  // Create area path (for gradient fill)
  const areaPath = `${pathData} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`;

  // Determine if price is trending up or down
  const firstPrice = data[0].price;
  const lastPrice = data[data.length - 1].price;
  const isUpward = lastPrice > firstPrice;
  const lineColor = isUpward ? '#10b981' : '#ef4444';
  
  // Generate unique gradient ID
  const gradientId = `gradient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  return `
    <svg width="${width}" height="${height}" class="price-chart-svg">
      <defs>
        <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:${lineColor};stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:${lineColor};stop-opacity:0.05" />
        </linearGradient>
      </defs>
      <path d="${areaPath}" fill="url(#${gradientId})" />
      <path d="${pathData}" 
            fill="none" 
            stroke="${lineColor}" 
            stroke-width="2" 
            stroke-linecap="round" 
            stroke-linejoin="round" />
      ${points.map((point, index) => {
        // Only show dots for first, middle, and last points
        if (index === 0 || index === Math.floor(points.length / 2) || index === points.length - 1) {
          return `<circle cx="${point.x}" cy="${point.y}" r="3" fill="${lineColor}" />`;
        }
        return '';
      }).join('')}
    </svg>
  `;
}

/**
 * Render chart in container
 * @param {HTMLElement} container - Container element
 * @param {Array<{date: string, price: number}>} data - Historical data
 * @param {Object} options - Chart options
 */
export function renderChart(container, data, options = {}) {
  const {
    width = 280,
    height = 120,
    color = '#6366f1'
  } = options;

  const svg = createLineChart(data, width, height, color);
  container.innerHTML = svg;
}

