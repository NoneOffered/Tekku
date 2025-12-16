/**
 * Mock/Example Data for Market Prices
 * Used as fallback when real data is unavailable
 * Ensures UI and charts always work
 */

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
 * @property {Array<{date: string, price: number}>} historicalData - 24 months of historical prices
 */

/**
 * Example price data for all commodities
 * @type {Object<string, PriceData>}
 */
export const EXAMPLE_PRICES = {
  "Gold": {
    commodity: "Gold",
    price: 2650.50,
    unit: "USD/oz",
    change: 12.30,
    changePercent: 0.47,
    lastUpdated: new Date().toISOString(),
    source: "Example Data",
    isMockData: true
  },
  "Silver": {
    commodity: "Silver",
    price: 24.85,
    unit: "USD/oz",
    change: -0.15,
    changePercent: -0.60,
    lastUpdated: new Date().toISOString(),
    source: "Example Data",
    isMockData: true
  },
  "Platinum": {
    commodity: "Platinum",
    price: 985.20,
    unit: "USD/oz",
    change: 5.80,
    changePercent: 0.59,
    lastUpdated: new Date().toISOString(),
    source: "Example Data",
    isMockData: true
  },
  "Copper": {
    commodity: "Copper",
    price: 4.25,
    unit: "USD/lb",
    change: 0.08,
    changePercent: 1.92,
    lastUpdated: new Date().toISOString(),
    source: "Example Data",
    isMockData: true
  },
  "Lithium": {
    commodity: "Lithium",
    price: 18500,
    unit: "USD/metric ton",
    change: -250,
    changePercent: -1.33,
    lastUpdated: new Date().toISOString(),
    source: "Example Data",
    isMockData: true
  },
  "Nickel": {
    commodity: "Nickel",
    price: 16800,
    unit: "USD/metric ton",
    change: 120,
    changePercent: 0.72,
    lastUpdated: new Date().toISOString(),
    source: "Example Data",
    isMockData: true
  },
  "Cobalt": {
    commodity: "Cobalt",
    price: 32500,
    unit: "USD/metric ton",
    change: -450,
    changePercent: -1.37,
    lastUpdated: new Date().toISOString(),
    source: "Example Data",
    isMockData: true
  },
  "Graphite": {
    commodity: "Graphite",
    price: 1250,
    unit: "USD/metric ton",
    change: 25,
    changePercent: 2.04,
    lastUpdated: new Date().toISOString(),
    source: "Example Data",
    isMockData: true
  },
  "Rare Earths": {
    commodity: "Rare Earths",
    price: 85000,
    unit: "USD/metric ton",
    change: 1200,
    changePercent: 1.43,
    lastUpdated: new Date().toISOString(),
    source: "Example Data",
    isMockData: true
  },
  "Electricity": {
    commodity: "Electricity",
    price: 85.50,
    unit: "USD/MWh",
    change: 2.30,
    changePercent: 2.76,
    lastUpdated: new Date().toISOString(),
    source: "Example Data",
    isMockData: true
  },
  "Gas": {
    commodity: "Gas",
    price: 3.25,
    unit: "USD/MMBtu",
    change: -0.12,
    changePercent: -3.57,
    lastUpdated: new Date().toISOString(),
    source: "Example Data",
    isMockData: true
  }
};

/**
 * Generate 24 months of historical price data
 * @param {number} currentPrice - Current price
 * @param {number} volatility - Volatility factor (0-1)
 * @returns {Array<{date: string, price: number}>}
 */
function generateHistoricalData(currentPrice, volatility = 0.15) {
  const data = [];
  const now = new Date();
  
  for (let i = 23; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    
    const monthsAgo = i;
    const trendFactor = monthsAgo / 23;
    const basePrice = currentPrice * (1 - volatility * (1 - trendFactor));
    const variation = (Math.random() - 0.5) * volatility * 0.3;
    const price = basePrice * (1 + variation);
    
    data.push({
      date: date.toISOString(),
      price: Math.max(price, currentPrice * 0.5)
    });
  }
  
  return data;
}

/**
 * Get example price data for a commodity
 * @param {string} commodity - Commodity name
 * @returns {PriceData}
 */
export function getExamplePrice(commodity) {
  const data = EXAMPLE_PRICES[commodity];
  if (!data) {
    throw new Error(`No example data available for ${commodity}`);
  }
  
  // Generate historical data if not present
  const historicalData = data.historicalData || generateHistoricalData(data.price, 0.15);
  
  // Update timestamp to current time
  return {
    ...data,
    historicalData,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Get all example prices
 * @returns {PriceData[]}
 */
export function getAllExamplePrices() {
  return Object.values(EXAMPLE_PRICES).map(price => {
    const historicalData = price.historicalData || generateHistoricalData(price.price, 0.15);
    return {
      ...price,
      historicalData,
      lastUpdated: new Date().toISOString()
    };
  });
}

/**
 * Check if data is example/mock data
 * @param {PriceData} data
 * @returns {boolean}
 */
export function isExampleData(data) {
  return data && data.isMockData === true;
}

