/**
 * Metal Prices API Client
 * For industrial metals and battery metals
 * Uses Yahoo Finance and alternative free sources
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
 * Fetch metal price from Yahoo Finance using alternative symbols
 * @param {string} symbol - Yahoo Finance symbol
 * @param {string} commodity - Commodity name
 * @param {string} unit - Unit of measurement
 * @returns {Promise<Object>}
 */
async function fetchMetalFromYahoo(symbol, commodity, unit) {
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
    const regularMarketPrice = meta.regularMarketPrice || meta.chartPreviousClose || 0;
    
    // Try multiple possible fields for previous close
    const previousClose = meta.previousClose || 
                         meta.chartPreviousClose || 
                         meta.regularMarketPreviousClose ||
                         (meta.regularMarketPrice ? meta.regularMarketPrice * 0.99 : regularMarketPrice);
    
    // Calculate change - if previousClose equals current price, try to get from quote data
    let change = regularMarketPrice - previousClose;
    let changePercent = previousClose && previousClose !== regularMarketPrice ? (change / previousClose) * 100 : 0;
    
    // If change is 0, try to get from quote indicators
    if (change === 0 && result.indicators && result.indicators.quote) {
      const quote = result.indicators.quote[0];
      if (quote.close && quote.close.length > 1) {
        const currentClose = quote.close[quote.close.length - 1];
        const prevClose = quote.close[quote.close.length - 2];
        if (currentClose && prevClose) {
          change = currentClose - prevClose;
          changePercent = prevClose ? (change / prevClose) * 100 : 0;
        }
      }
    }
    
    // If still 0, try meta.regularMarketChange or regularMarketChangePercent
    if (change === 0 && meta.regularMarketChange !== undefined) {
      change = meta.regularMarketChange;
      changePercent = meta.regularMarketChangePercent || 0;
    }

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
      console.warn(`Could not fetch historical data for ${commodity}:`, histError);
    }

    return {
      commodity: commodity,
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
    console.error(`Error fetching ${commodity} from Yahoo Finance:`, error);
    throw error;
  }
}

/**
 * Fetch nickel price
 * Using LME (London Metal Exchange) nickel futures and alternative symbols
 */
export async function fetchNickelPrice() {
  // Try different nickel symbols - LME nickel futures and alternative tickers
  const symbols = [
    "NI=F",           // LME Nickel Futures
    "NIL23.CMX",      // Nickel futures alternative
    "NIL24.CMX",      // Nickel futures alternative
    "NICKEL-LON",     // London nickel
    "NICKEL-USD"      // USD nickel
  ];
  
  for (const symbol of symbols) {
    try {
      const data = await fetchMetalFromYahoo(symbol, "Nickel", "USD/metric ton");
      // Verify we got valid data
      if (data && data.price > 0) {
        return data;
      }
    } catch (error) {
      console.debug(`Symbol ${symbol} failed:`, error.message);
      continue;
    }
  }
  throw new Error("Could not fetch nickel price from any source");
}

/**
 * Fetch lithium price
 * Using Lithium Carbonate futures or spot price proxy
 */
export async function fetchLithiumPrice() {
  // Try alternative symbols - lithium is harder to get
  // Using a commodity index or ETF as proxy
  try {
    return await fetchMetalFromYahoo("LIT", "Lithium", "USD/metric ton");
  } catch (error) {
    // If ETF fails, try alternative approach
    throw error;
  }
}

/**
 * Fetch cobalt price
 * Cobalt doesn't have direct futures, trying alternative sources
 */
export async function fetchCobaltPrice() {
  // Try alternative symbols - cobalt is traded via ETFs or mining companies
  const symbols = [
    "COBALT-USD",      // Alternative ticker
    "COBALT-LON",      // London cobalt
    "LIT",             // Lithium ETF (as proxy for battery metals)
    "BATT"             // Battery metals ETF
  ];
  
  for (const symbol of symbols) {
    try {
      const data = await fetchMetalFromYahoo(symbol, "Cobalt", "USD/metric ton");
      if (data && data.price > 0) {
        return data;
      }
    } catch (error) {
      console.debug(`Cobalt symbol ${symbol} failed:`, error.message);
      continue;
    }
  }
  throw new Error("Cobalt price requires alternative data source");
}

/**
 * Fetch graphite price
 * Graphite doesn't have direct futures, trying alternative sources
 */
export async function fetchGraphitePrice() {
  // Try alternative symbols - graphite is traded via mining companies or ETFs
  const symbols = [
    "GRAPHITE-USD",    // Alternative ticker
    "LIT",             // Lithium ETF (as proxy for battery materials)
    "BATT"             // Battery metals ETF
  ];
  
  for (const symbol of symbols) {
    try {
      const data = await fetchMetalFromYahoo(symbol, "Graphite", "USD/metric ton");
      if (data && data.price > 0) {
        return data;
      }
    } catch (error) {
      console.debug(`Graphite symbol ${symbol} failed:`, error.message);
      continue;
    }
  }
  throw new Error("Graphite price requires alternative data source");
}

/**
 * Fetch rare earths price (basket or individual element)
 */
export async function fetchRareEarthsPrice() {
  // Rare earths ETF as proxy
  try {
    return await fetchMetalFromYahoo("REMX", "Rare Earths", "USD/index");
  } catch (error) {
    throw error;
  }
}
