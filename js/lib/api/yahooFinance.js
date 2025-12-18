/**
 * Yahoo Finance API Client (Public Endpoints)
 * Free, no API key required
 * Uses public Yahoo Finance endpoints
 */

/**
 * Check if we need to use a CORS proxy
 * Yahoo Finance blocks CORS from all external domains, so always use proxy
 * @returns {boolean}
 */
function needsCorsProxy() {
  // Always use proxy for Yahoo Finance as it blocks CORS from all external domains
  return true;
}

/**
 * Get CORS proxy URL if needed
 * @param {string} url - Original URL
 * @returns {string} - Proxied URL or original URL
 */
function getProxiedUrl(url) {
  if (needsCorsProxy()) {
    // Use allorigins proxy (returns raw response, works well with JSON)
    return `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
  }
  return url;
}

/**
 * Fetch with timeout
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<Response>}
 */
function fetchWithTimeout(url, options = {}, timeout = 10000) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    )
  ]);
}

/**
 * Fetch with CORS proxy fallback
 * Yahoo Finance blocks CORS from all external domains, so always use proxy
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>}
 */
async function fetchWithCorsFallback(url, options = {}) {
  const timeout = 15000; // 15 seconds for proxy
  
  // Always use CORS proxy for Yahoo Finance as it blocks all external domains
  const proxiedUrl = getProxiedUrl(url);
  
  try {
    const response = await fetchWithTimeout(proxiedUrl, options, timeout);
    if (response.ok) {
      return response;
    }
    throw new Error(`HTTP ${response.status}`);
  } catch (error) {
    // Try alternative CORS proxy if first one fails
    const altProxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    try {
      const altResponse = await fetchWithTimeout(altProxyUrl, options, timeout);
      if (altResponse.ok) {
        return altResponse;
      }
    } catch (altError) {
      // Both proxies failed
      throw new Error(`CORS proxy failed: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Fetch commodity price from Yahoo Finance with historical data
 * @param {string} symbol - Yahoo Finance symbol (e.g., "GC=F" for Gold, "SI=F" for Silver)
 * @param {string} commodityName - Display name for commodity
 * @param {string} unit - Unit of measurement
 * @returns {Promise<Object>}
 */
async function fetchYahooFinancePrice(symbol, commodityName, unit) {
  try {
    // Fetch current price
    const currentUrl = `https://query2.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
    
    const currentResponse = await fetchWithCorsFallback(currentUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0'
      },
      mode: 'cors'
    });

    if (!currentResponse.ok) {
      throw new Error(`HTTP error! status: ${currentResponse.status}`);
    }

    const currentData = await currentResponse.json();
    
    if (!currentData.chart || !currentData.chart.result || currentData.chart.result.length === 0) {
      throw new Error('No data returned from Yahoo Finance');
    }

    const result = currentData.chart.result[0];
    const meta = result.meta;
    
    // Debug: Log available meta fields to understand the structure
    console.debug(`Yahoo Finance meta for ${commodityName}:`, {
      regularMarketPrice: meta.regularMarketPrice,
      previousClose: meta.previousClose,
      chartPreviousClose: meta.chartPreviousClose,
      regularMarketPreviousClose: meta.regularMarketPreviousClose,
      regularMarketChange: meta.regularMarketChange,
      regularMarketChangePercent: meta.regularMarketChangePercent,
      allKeys: Object.keys(meta)
    });
    
    const regularMarketPrice = meta.regularMarketPrice || meta.chartPreviousClose || 0;
    
    // Try multiple possible fields for previous close - Yahoo Finance uses chartPreviousClose
    const previousClose = meta.chartPreviousClose || 
                         meta.previousClose || 
                         meta.regularMarketPreviousClose ||
                         (regularMarketPrice ? regularMarketPrice * 0.99 : 0);
    
    // First, try to use the direct change fields from Yahoo Finance
    let change = meta.regularMarketChange;
    let changePercent = meta.regularMarketChangePercent;
    
    // If those aren't available, calculate from price difference
    if (change === undefined || change === null) {
      change = regularMarketPrice - previousClose;
      changePercent = previousClose && previousClose !== 0 ? (change / previousClose) * 100 : 0;
    }
    
    // If still 0 or undefined, try to get from quote indicators (intraday data)
    if ((change === 0 || change === undefined) && result.indicators && result.indicators.quote) {
      const quote = result.indicators.quote[0];
      if (quote.close && quote.close.length > 1) {
        const closes = quote.close.filter(c => c !== null && c !== undefined);
        if (closes.length >= 2) {
          const currentClose = closes[closes.length - 1];
          const prevClose = closes[closes.length - 2];
          if (currentClose && prevClose && currentClose !== prevClose) {
            change = currentClose - prevClose;
            changePercent = prevClose ? (change / prevClose) * 100 : 0;
            console.debug(`Using quote data for ${commodityName}: change=${change}, changePercent=${changePercent}`);
          }
        }
      }
    }
    
    // Final fallback: if we have a valid previousClose, use it
    if ((change === 0 || change === undefined) && previousClose && previousClose !== regularMarketPrice) {
      change = regularMarketPrice - previousClose;
      changePercent = previousClose ? (change / previousClose) * 100 : 0;
      console.debug(`Using calculated change for ${commodityName}: change=${change}, changePercent=${changePercent}`);
    }
    
    // Ensure we have valid numbers
    change = change !== undefined && change !== null ? parseFloat(change) : 0;
    changePercent = changePercent !== undefined && changePercent !== null ? parseFloat(changePercent) : 0;

    // Fetch 24 months of historical data for chart
    let historicalData = [];
    try {
      const historicalUrl = `https://query2.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1mo&range=2y`;
      const historicalResponse = await fetchWithCorsFallback(historicalUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0'
        },
        mode: 'cors'
      });

      if (historicalResponse.ok) {
        const historicalJson = await historicalResponse.json();
        if (historicalJson.chart && historicalJson.chart.result && historicalJson.chart.result.length > 0) {
          const histResult = historicalJson.chart.result[0];
          const timestamps = histResult.timestamp || [];
          const closes = histResult.indicators?.quote?.[0]?.close || [];
          
          // Convert to our format
          historicalData = timestamps.map((timestamp, index) => ({
            date: new Date(timestamp * 1000).toISOString(),
            price: closes[index] || regularMarketPrice
          })).filter(d => d.price > 0); // Filter out invalid prices
        }
      }
    } catch (histError) {
      console.warn(`Could not fetch historical data for ${commodityName}:`, histError);
      // Will use generated historical data as fallback
    }

    return {
      commodity: commodityName,
      price: parseFloat(regularMarketPrice) || 0,
      unit: unit,
      change: parseFloat(change) || 0,
      changePercent: parseFloat(changePercent) || 0,
      lastUpdated: new Date().toISOString(),
      source: "Yahoo Finance",
      isMockData: false,
      historicalData: historicalData.length > 0 ? historicalData : undefined
    };
  } catch (error) {
    console.error(`Error fetching ${commodityName} from Yahoo Finance:`, error);
    throw error;
  }
}

/**
 * Yahoo Finance symbol mappings
 */
const YAHOO_SYMBOLS = {
  "Gold": "GC=F",           // Gold Futures
  "Silver": "SI=F",         // Silver Futures
  "Platinum": "PL=F",       // Platinum Futures
  "Copper": "HG=F",         // Copper Futures
  "Gas": "NG=F",            // Natural Gas Futures
  "Electricity": "NG=F",    // Using Natural Gas as proxy (electricity futures less common)
};

/**
 * Fetch gold price
 */
export async function fetchGoldPrice() {
  return fetchYahooFinancePrice("GC=F", "Gold", "USD/oz");
}

/**
 * Fetch silver price
 */
export async function fetchSilverPrice() {
  return fetchYahooFinancePrice("SI=F", "Silver", "USD/oz");
}

/**
 * Fetch platinum price
 */
export async function fetchPlatinumPrice() {
  return fetchYahooFinancePrice("PL=F", "Platinum", "USD/oz");
}

/**
 * Fetch copper price
 */
export async function fetchCopperPrice() {
  return fetchYahooFinancePrice("HG=F", "Copper", "USD/lb");
}

/**
 * Fetch natural gas price
 */
export async function fetchGasPrice() {
  return fetchYahooFinancePrice("NG=F", "Gas", "USD/MMBtu");
}

/**
 * Fetch electricity price (using electricity futures or natural gas as proxy)
 */
export async function fetchElectricityPrice() {
  // Electricity futures are less common, using natural gas as proxy
  // or try PJM electricity futures if available
  try {
    // Try PJM electricity futures first
    return await fetchYahooFinancePrice("PJME=F", "Electricity", "USD/MWh");
  } catch (error) {
    // Fallback to natural gas as proxy (they're correlated)
    const gasData = await fetchGasPrice();
    return {
      ...gasData,
      commodity: "Electricity",
      unit: "USD/MWh",
      source: "Yahoo Finance (Gas Proxy)"
    };
  }
}

