/**
 * FreeGoldPrice.org API Client
 * Free API for Gold, Silver, Platinum prices
 * No API key required
 */

/**
 * Fetch gold price from FreeGoldPrice.org
 * @returns {Promise<Object>}
 */
export async function fetchGoldPrice() {
  try {
    // FreeGoldPrice.org API endpoint
    const response = await fetch('https://freegoldprice.org/api/gold-price', {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Parse response (adjust based on actual API response structure)
    return {
      commodity: "Gold",
      price: parseFloat(data.price || data.rate || 0),
      unit: "USD/oz",
      change: 0, // API may not provide change
      changePercent: 0,
      lastUpdated: new Date().toISOString(),
      source: "FreeGoldPrice.org",
      isMockData: false
    };
  } catch (error) {
    console.error('Error fetching gold price:', error);
    throw error;
  }
}

/**
 * Fetch silver price from FreeGoldPrice.org
 * @returns {Promise<Object>}
 */
export async function fetchSilverPrice() {
  try {
    const response = await fetch('https://freegoldprice.org/api/silver-price', {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      commodity: "Silver",
      price: parseFloat(data.price || data.rate || 0),
      unit: "USD/oz",
      change: 0,
      changePercent: 0,
      lastUpdated: new Date().toISOString(),
      source: "FreeGoldPrice.org",
      isMockData: false
    };
  } catch (error) {
    console.error('Error fetching silver price:', error);
    throw error;
  }
}

/**
 * Fetch platinum price from FreeGoldPrice.org
 * @returns {Promise<Object>}
 */
export async function fetchPlatinumPrice() {
  try {
    const response = await fetch('https://freegoldprice.org/api/platinum-price', {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      commodity: "Platinum",
      price: parseFloat(data.price || data.rate || 0),
      unit: "USD/oz",
      change: 0,
      changePercent: 0,
      lastUpdated: new Date().toISOString(),
      source: "FreeGoldPrice.org",
      isMockData: false
    };
  } catch (error) {
    console.error('Error fetching platinum price:', error);
    throw error;
  }
}


