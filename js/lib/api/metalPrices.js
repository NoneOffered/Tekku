/**
 * Metal Prices API Client
 * For industrial metals and battery metals
 * Uses Yahoo Finance and alternative free sources
 */

/**
 * Check if we need to use a CORS proxy
 * @returns {boolean}
 */
function needsCorsProxy() {
  return window.location.hostname.includes('github.io') || 
         window.location.hostname.includes('github.com');
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
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>}
 */
async function fetchWithCorsFallback(url, options = {}) {
  const timeout = 10000; // 10 seconds
  
  try {
    // Try direct fetch first (only if not on GitHub Pages)
    if (!needsCorsProxy()) {
      const response = await fetchWithTimeout(url, options, timeout);
      if (response.ok) {
        return response;
      }
      throw new Error(`HTTP ${response.status}`);
    }
    
    // On GitHub Pages, use proxy directly
    const proxiedUrl = getProxiedUrl(url);
    const response = await fetchWithTimeout(proxiedUrl, options, timeout);
    if (response.ok) {
      return response;
    }
    throw new Error(`HTTP ${response.status}`);
  } catch (error) {
    // If proxy fails, try direct (might work in some cases)
    if (needsCorsProxy() && !url.includes('allorigins.win')) {
      try {
        const response = await fetchWithTimeout(url, options, timeout);
        if (response.ok) {
          return response;
        }
      } catch (directError) {
        // Both failed
        throw new Error(`CORS proxy failed: ${error.message}, Direct failed: ${directError.message}`);
      }
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
    const regularMarketPrice = meta.regularMarketPrice;
    const previousClose = meta.previousClose || regularMarketPrice;
    const change = regularMarketPrice - previousClose;
    const changePercent = previousClose ? (change / previousClose) * 100 : 0;

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
 * Using LME (London Metal Exchange) nickel futures
 */
export async function fetchNickelPrice() {
  // Try different nickel symbols
  const symbols = ["NI=F", "NIL23.CMX", "NIL24.CMX"];
  for (const symbol of symbols) {
    try {
      return await fetchMetalFromYahoo(symbol, "Nickel", "USD/metric ton");
    } catch (error) {
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
 */
export async function fetchCobaltPrice() {
  // Cobalt doesn't have direct futures, using a proxy or alternative source
  // For now, we'll need to use web scraping or alternative API
  throw new Error("Cobalt price requires alternative data source");
}

/**
 * Fetch graphite price
 */
export async function fetchGraphitePrice() {
  // Graphite doesn't have direct futures
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
