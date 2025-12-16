# Market Prices Implementation Plan

## Overview
This plan outlines the implementation of real-time market price tracking for commodities on the Tekku Solutions homepage.

**Design & Implementation Style:** Inspired by [Formbricks](https://github.com/formbricks/formbricks) - modern, clean, well-structured code with component-based architecture, even in vanilla JavaScript.

**⚠️ CRITICAL REQUIREMENT: All data sources must be 100% FREE. No paid APIs, subscriptions, or premium services will be used.**

## Commodities to Track
1. **Electricity** (per MWh)
2. **Gas** (Natural Gas, per MMBtu or per therm)
3. **Lithium** (per metric ton)
4. **Platinum** (per ounce)
5. **Silver** (per ounce)
6. **Gold** (per ounce)
7. **Cobalt** (per metric ton)
8. **Nickel** (per metric ton)
9. **Graphite** (per metric ton)
10. **Rare Earths** (per metric ton - may need to track individual elements or basket)
11. **Copper** (per pound or metric ton)

---

## Phase 1: Research & Data Source Selection (FREE DATA ONLY)

### 1.1 Free API Research

**✅ Confirmed Free APIs (No Payment Required):**

**Precious Metals (Gold, Silver, Platinum):**
- **FreeGoldPrice.org API** - Free hourly API calls, no API key required initially
  - URL: `https://freegoldprice.org/api/`
  - Covers: Gold, Silver, Platinum, Palladium
  - Rate Limit: Hourly updates (free tier)
  - No API key needed for basic usage

**Base Metals (Copper, Nickel, Cobalt, Lithium):**
- **Metals-API** - Free tier with API key (free registration)
  - URL: `https://api.metals.live/v1/spot/` or similar
  - Free tier: Limited requests per month
  - Covers: Copper, Nickel, Aluminum, Zinc, Lead, Tin
  - Note: May need to check current free tier limits

**Energy (Electricity & Gas):**
- **EIA (U.S. Energy Information Administration)** - Completely free, public data
  - URL: `https://api.eia.gov/v2/`
  - Free API key available (just registration)
  - Covers: Electricity prices, Natural Gas prices (US data)
  - No cost, government data source

**Alternative Free Sources:**
- **Yahoo Finance** (Unofficial/Public endpoints) - Free, no API key
  - Can fetch via public URLs (may be rate-limited)
  - Covers many commodities
  - Note: Unofficial, may change without notice

**Specialized/Alternative Data Sources:**
- **IEA Critical Minerals Data Explorer** - Free public data
  - URL: `https://www.iea.org/data-and-statistics/data-tools/critical-minerals-data-explorer`
  - Covers: Lithium, Rare Earths (demand projections, may have price data)
  - May require web scraping for real-time prices

**Web Scraping Options (For Hard-to-Find Data):**
- **Public commodity websites** - Scrape price data from:
  - Trading Economics (public data)
  - Investing.com (public commodity pages)
  - MarketWatch (public commodity data)
  - Note: Must respect robots.txt and rate limits
  - Use CORS proxy if needed (e.g., `https://api.allorigins.win/`)

### 1.2 Free Data Source Strategy

**Recommended: Hybrid Free Approach**

**Primary Strategy:**
1. **FreeGoldPrice.org** - For Gold, Silver, Platinum (no API key needed)
2. **EIA API** - For Electricity & Gas (free API key, just registration)
3. **Metals-API free tier** - For Copper, Nickel (free tier with registration)
4. **Web scraping** - For Lithium, Cobalt, Graphite, Rare Earths (from public websites)

**Fallback Strategy:**
- If APIs have rate limits, implement caching
- Use multiple free sources as backups
- Implement graceful degradation (show last known price if API fails)

**Commodity Mapping:**
- ✅ **Gold, Silver, Platinum** → FreeGoldPrice.org API
- ✅ **Copper, Nickel** → Metals-API (free tier) or Yahoo Finance scraping
- ✅ **Electricity, Gas** → EIA API (free)
- ⚠️ **Lithium, Cobalt, Graphite, Rare Earths** → Web scraping from public sites
- ✅ **Copper** (duplicate) → Same as above

---

## Phase 2: UI/UX Design

### 2.1 Layout Options

**Option A: Price Cards Section**
- Add a new section below the hero text
- Grid layout of price cards (responsive: 2-3 columns on desktop, 1 on mobile)
- Each card shows:
  - Commodity name
  - Current price
  - Price change (24h or daily)
  - Change indicator (↑/↓ with color coding)
  - Last updated timestamp

**Option B: Sidebar Widget**
- Fixed or floating sidebar
- Compact view with expandable details
- Good for maintaining hero section prominence

**Option C: Tabbed Interface**
- Tabs for different categories (Energy, Precious Metals, Industrial Metals)
- More organized for many commodities

**Recommended: Option A** - Most visible and user-friendly

### 2.2 Visual Design Elements (Formbricks-Style)

**Design Philosophy:** Clean, modern, professional - inspired by Formbricks' polished UI

- **Color System:**
  - **Primary:** Modern blue/cyan accent (like Formbricks' brand colors)
  - **Success (Price Up):** Green (#10b981 or similar)
  - **Danger (Price Down):** Red (#ef4444 or similar)
  - **Neutral:** Gray scale for backgrounds and text
  - **Accent:** Subtle highlights for interactive elements

- **Card Design (Formbricks-Inspired):**
  - Clean white/light cards with subtle shadows
  - Rounded corners (8-12px border-radius)
  - Hover effects (subtle lift/shadow increase)
  - Smooth transitions (200-300ms)
  - Consistent padding and spacing

- **Typography:**
  - Modern sans-serif (Poppins or Inter - matching current site)
  - Clear hierarchy (headings, body, labels)
  - Proper font weights (400, 500, 600, 700)

- **Icons:** 
  - SVG icons for commodities (or icon font)
  - Consistent icon size and style
  - Color-coded by commodity type

- **Loading States:** 
  - Skeleton loaders (Formbricks-style shimmer effect)
  - Smooth fade-in animations
  - No jarring transitions

- **Error States:** 
  - Friendly error messages
  - Retry buttons with clear CTAs
  - Fallback to example data seamlessly

- **Example Data Indicator:** 
  - Small badge with "Example" text
  - Subtle background color (e.g., light yellow/blue)
  - Icon or badge in top-right corner of card
  - Tooltip on hover explaining it's demo data

- **Refresh Indicator:** 
  - Subtle spinner or pulse animation
  - Non-intrusive visual feedback
  - Smooth state transitions

- **Charts/Graphs:** 
  - Clean, minimal chart design
  - Smooth animations
  - Responsive and touch-friendly
  - Works perfectly with example data

### 2.3 Responsive Design
- Mobile-first approach
- Stack cards vertically on small screens
- Maintain readability on all devices
- Touch-friendly interaction areas

---

## Phase 3: Technical Implementation

### 3.1 File Structure (Formbricks-Style Organization)
```
├── index.html (modified)
├── index.js (modified - entry point)
├── style.css (modified - main styles)
├── js/
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.js (API communication layer)
│   │   │   ├── freeGoldPrice.js (FreeGoldPrice.org client)
│   │   │   ├── eia.js (EIA API client)
│   │   │   └── metalsApi.js (Metals-API client)
│   │   ├── scraper/
│   │   │   └── webScraper.js (web scraping utilities)
│   │   ├── utils/
│   │   │   ├── formatters.js (price formatting, date formatting)
│   │   │   ├── validators.js (data validation)
│   │   │   └── cache.js (localStorage cache management)
│   │   └── constants.js (constants and configuration)
│   ├── components/
│   │   ├── PriceCard.js (price card component)
│   │   ├── PriceGrid.js (grid layout component)
│   │   ├── LoadingState.js (loading skeleton)
│   │   └── ErrorState.js (error display)
│   ├── services/
│   │   ├── priceTracker.js (main price tracking service)
│   │   └── dataService.js (data fetching orchestration)
│   ├── data/
│   │   └── mockData.js (example/mock data)
│   └── types.js (JSDoc type definitions)
├── config/
│   └── apiConfig.js (API keys and endpoints)
└── styles/
    ├── components.css (component-specific styles)
    └── utilities.css (utility classes)
```

**Formbricks-Inspired Principles:**
- **Separation of Concerns** - Clear boundaries between layers
- **Modular Design** - Each file has a single responsibility
- **Reusability** - Components and utilities are reusable
- **Type Safety** - JSDoc annotations for better development experience
- **Scalability** - Easy to extend and maintain

### 3.2 Data Structure
```javascript
{
  commodity: "Gold",
  price: 2650.50,
  unit: "USD/oz",
  change: 12.30,
  changePercent: 0.47,
  lastUpdated: "2024-01-15T10:30:00Z",
  source: "Alpha Vantage",
  isMockData: false  // Flag to indicate if using example data
}
```

### 3.2.1 Example/Mock Data Structure
**Critical:** If real data is unavailable, use example data so charts/display still work.

```javascript
// Example data for all commodities (fallback)
const EXAMPLE_PRICES = {
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
```

**Mock Data Strategy:**
- Use realistic price ranges based on current market conditions
- Include both positive and negative changes for visual variety
- Update timestamps to current time
- Clearly mark as example data (isMockData: true)
- Display "Example Data" in UI so users know it's not real-time

### 3.3 Core Functions

**lib/api/client.js (Formbricks-Style API Client):**
```javascript
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
 */

/**
 * Main API client with error handling and retry logic
 * @param {string} commodityName
 * @returns {Promise<PriceData>}
 */
async function fetchCommodityPrice(commodityName) { }

/**
 * Batch fetch all commodities with parallel requests
 * @returns {Promise<PriceData[]>}
 */
async function fetchAllPrices() { }

/**
 * Handle API errors with retry logic and fallbacks
 * @param {Error} error
 * @param {string} commodity
 * @returns {PriceData}
 */
function handleApiError(error, commodity) { }
```

**lib/api/freeGoldPrice.js:**
- `fetchGoldPrice()` - Fetch gold price
- `fetchSilverPrice()` - Fetch silver price
- `fetchPlatinumPrice()` - Fetch platinum price
- All with proper error handling and type safety

**lib/api/eia.js:**
- `fetchElectricityPrice()` - Fetch electricity price
- `fetchGasPrice()` - Fetch natural gas price
- Rate limiting and caching built-in

**lib/api/metalsApi.js:**
- `fetchCopperPrice()` - Fetch copper price
- `fetchNickelPrice()` - Fetch nickel price
- API key management and error handling

**webScraper.js:**
- `scrapeCommodityPrice(commodity, source)` - Scrape price from public website
- `scrapeLithiumPrice()` - Scrape lithium price
- `scrapeCobaltPrice()` - Scrape cobalt price
- `scrapeGraphitePrice()` - Scrape graphite price
- `scrapeRareEarthsPrice()` - Scrape rare earths price
- `useCorsProxy(url)` - Use CORS proxy if needed for scraping
- `parsePriceFromHTML(html, selector)` - Parse price from HTML using CSS selectors
- `delay(ms)` - Add delays between requests to respect rate limits

**Web Scraping Implementation Notes:**
- Use `fetch()` with CORS proxy for cross-origin requests
- Parse HTML using DOMParser (client-side) or regex patterns
- Target specific CSS selectors on public commodity pages
- Implement error handling for when website structure changes
- Cache scraped data to minimize requests
- Add 2-3 second delays between scraping requests
- **If scraping fails, immediately use example data**

**mockData.js:**
- `getExamplePrice(commodity)` - Get example price data for commodity
- `getAllExamplePrices()` - Get all example prices
- `generateRealisticPrice(commodity, basePrice)` - Generate realistic example price
- `updateExampleTimestamp(data)` - Update timestamp to current time
- `isExampleData(data)` - Check if data is example/mock data

**services/priceTracker.js (Formbricks-Style Service):**
```javascript
/**
 * Price tracking service - main orchestration layer
 * Handles state management, updates, and data flow
 */
class PriceTracker {
  constructor() {
    this.state = {
      prices: new Map(),
      isLoading: false,
      lastUpdate: null,
      errors: new Map()
    };
  }

  /**
   * Initialize price tracking system
   * @returns {Promise<void>}
   */
  async initialize() { }

  /**
   * Update all prices with retry logic
   * @returns {Promise<void>}
   */
  async updatePrices() { }

  /**
   * Get price with fallback chain (real → cache → example)
   * @param {string} commodity
   * @returns {PriceData}
   */
  getPriceWithFallback(commodity) { }

  /**
   * Ensure all commodities have data (use example if needed)
   * @returns {void}
   */
  ensureAllCommoditiesHaveData() { }

  /**
   * Subscribe to price updates (event-driven)
   * @param {Function} callback
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) { }
}
```

**lib/utils/formatters.js:**
- `formatPrice(price, unit)` - Format price with proper decimals and currency
- `formatChange(change, percent)` - Format change with +/- and color
- `formatDate(date)` - Format timestamps
- `formatCurrency(amount, currency)` - Currency formatting

**lib/utils/validators.js:**
- `validatePriceData(data)` - Validate price data structure
- `isValidPrice(price)` - Check if price is valid number
- `sanitizeCommodityName(name)` - Sanitize commodity names

**components/PriceCard.js (Component-Based):**
```javascript
/**
 * Price Card Component (Formbricks-style component)
 * Self-contained, reusable card component
 */
class PriceCard {
  constructor(container, data) {
    this.container = container;
    this.data = data;
    this.render();
  }

  /**
   * Render the price card
   * @returns {HTMLElement}
   */
  render() { }

  /**
   * Update card with new data
   * @param {PriceData} data
   */
  update(data) { }

  /**
   * Show loading state
   */
  showLoading() { }

  /**
   * Show error state
   * @param {Error} error
   */
  showError(error) { }

  /**
   * Render mock data indicator
   */
  renderMockIndicator() { }
}
```

**components/PriceGrid.js:**
- Grid layout component
- Responsive breakpoints
- Smooth animations
- Handles card rendering and updates

**components/LoadingState.js:**
- Skeleton loader component
- Shimmer animation (Formbricks-style)
- Matches card layout

**components/ErrorState.js:**
- Error display component
- Retry functionality
- User-friendly messages

### 3.4 Update Strategy
- **Initial Load:** 
  - Fetch all prices on page load
  - **If any commodity fails to load, immediately use example data**
  - Ensure all commodities display (real or example) so charts work
- **Auto-Refresh:** 
  - Option 1: Poll every 5-15 minutes (depends on API rate limits)
  - Option 2: WebSocket connection (if API supports)
  - On refresh failure, keep example data visible
- **Manual Refresh:** Button to manually update prices
- **Caching:** Store last known prices in localStorage for offline display
- **Fallback Priority:**
  1. Try real API data
  2. Try cached data
  3. **Use example data (ensures UI always works)**

---

## Phase 3.5: Formbricks-Style Code Patterns

### Modern JavaScript Patterns

**1. ES6 Modules:**
```javascript
// lib/api/client.js
export async function fetchCommodityPrice(commodity) { }

// index.js
import { fetchCommodityPrice } from './lib/api/client.js';
```

**2. Class-Based Components:**
```javascript
class PriceCard {
  constructor(container, data) {
    this.container = container;
    this.data = data;
    this.render();
  }
  
  render() {
    // Component rendering logic
  }
  
  update(newData) {
    // Update logic with smooth transitions
  }
}
```

**3. Type Safety with JSDoc:**
```javascript
/**
 * @typedef {Object} PriceData
 * @property {string} commodity
 * @property {number} price
 * @property {string} unit
 */

/**
 * Fetches commodity price
 * @param {string} commodity - Commodity name
 * @returns {Promise<PriceData>}
 */
async function fetchPrice(commodity) { }
```

**4. Error Handling:**
```javascript
async function fetchWithRetry(fn, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await delay(1000 * (i + 1)); // Exponential backoff
    }
  }
}
```

**5. State Management Pattern:**
```javascript
class PriceTracker {
  constructor() {
    this.state = {
      prices: new Map(),
      isLoading: false,
      subscribers: []
    };
  }
  
  setState(updates) {
    this.state = { ...this.state, ...updates };
    this.notifySubscribers();
  }
  
  subscribe(callback) {
    this.state.subscribers.push(callback);
    return () => {
      this.state.subscribers = this.state.subscribers.filter(cb => cb !== callback);
    };
  }
}
```

### CSS Architecture (Formbricks-Inspired)

**1. CSS Custom Properties (Design Tokens):**
```css
:root {
  /* Colors */
  --color-primary: #03a9f4;
  --color-success: #10b981;
  --color-danger: #ef4444;
  --color-neutral: #6b7280;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* Typography */
  --font-family: 'Poppins', sans-serif;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  
  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-base: 200ms ease;
  --transition-slow: 300ms ease;
}
```

**2. Component Styles:**
```css
.price-card {
  background: white;
  border-radius: 12px;
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-md);
  transition: transform var(--transition-base), 
              box-shadow var(--transition-base);
}

.price-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
```

**3. Utility Classes:**
```css
.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.gap-md { gap: var(--spacing-md); }

.text-success { color: var(--color-success); }
.text-danger { color: var(--color-danger); }
.text-neutral { color: var(--color-neutral); }
```

### Best Practices (Formbricks-Inspired)

1. **Code Organization:**
   - One file, one responsibility
   - Clear folder structure
   - Consistent naming conventions

2. **Error Handling:**
   - Always handle errors gracefully
   - Provide user-friendly messages
   - Log errors for debugging

3. **Performance:**
   - Lazy load when possible
   - Debounce/throttle expensive operations
   - Cache aggressively
   - Minimize re-renders

4. **Accessibility:**
   - Semantic HTML
   - ARIA labels where needed
   - Keyboard navigation support
   - Screen reader friendly

5. **Maintainability:**
   - Clear comments and documentation
   - Type annotations (JSDoc)
   - Consistent code style
   - Easy to extend

---

## Phase 4: Implementation Steps

### Step 1: Setup Free API Integration
1. Register for free API keys where needed (EIA, Metals-API)
   - EIA: https://www.eia.gov/opendata/register.php (free)
   - Metals-API: Check current free tier availability
2. Test APIs that don't require keys (FreeGoldPrice.org)
3. Create `apiConfig.js` for API keys (if any)
   - Note: Some free APIs don't require keys
   - Keep any keys secure, but free APIs are less sensitive
4. Implement basic API client with error handling
5. Set up web scraping functions for commodities without free APIs
6. Test API connectivity for each commodity

### Step 2: Create Price Display Components (Formbricks-Style)
1. **Design System Setup:**
   - Define CSS custom properties (colors, spacing, typography)
   - Create utility classes for common patterns
   - Set up component base styles

2. **Component Architecture:**
   - Build PriceCard component class
   - Create PriceGrid layout component
   - Implement LoadingState skeleton component
   - Build ErrorState component

3. **Styling (Formbricks-Inspired):**
   - Clean, modern card design with subtle shadows
   - Smooth transitions and hover effects
   - Responsive grid with CSS Grid
   - Mobile-first responsive breakpoints
   - Consistent spacing and typography

4. **State Management:**
   - Implement simple state management pattern
   - Event-driven updates
   - Reactive UI updates

### Step 3: Implement Price Tracking Service (Formbricks-Style)
1. **Service Layer:**
   - Create PriceTracker service class
   - Implement state management
   - Add event subscription system
   - Error handling and retry logic

2. **API Integration:**
   - Build modular API clients (one per source)
   - Implement rate limiting
   - Add request queuing
   - Cache management

3. **Data Flow:**
   - Implement data fetching orchestration
   - Add change calculation utilities
   - Price validation and sanitization
   - Fallback chain (real → cache → example)

4. **Auto-Refresh:**
   - Implement auto-refresh timer
   - Respect API rate limits
   - Background updates
   - Manual refresh capability

### Step 4: Integration (Formbricks-Style)
1. **HTML Structure:**
   - Add price section container to `index.html`
   - Use semantic HTML5 elements
   - Add data attributes for component initialization
   - Maintain accessibility (ARIA labels, etc.)

2. **JavaScript Initialization:**
   - Set up module imports in `index.js`
   - Initialize PriceTracker service
   - Mount PriceGrid component
   - Set up event listeners

3. **Style Integration:**
   - Integrate with existing design theme
   - Maintain visual consistency
   - Add Formbricks-inspired polish
   - Ensure smooth transitions

4. **Testing:**
   - Test on multiple devices/browsers
   - Test with real data, cached data, and example data
   - Verify responsive behavior
   - Check accessibility

### Step 5: Error Handling & Edge Cases
1. Handle API failures gracefully
2. Implement retry logic (max 2-3 retries)
3. **If data unavailable after retries, use example data immediately**
4. Handle missing data for specific commodities (use example data)
5. Add fallback to cached data (before using example)
6. **Ensure all commodities always have data (real or example)**
7. Display "Example Data" indicator when using mock data
8. **Charts must work with example data** - test thoroughly

### Step 6: Optimization
1. Implement request batching to reduce API calls
2. Add debouncing for manual refresh
3. Optimize re-renders
4. Minimize API calls within rate limits

---

## Phase 4.5: Example Data Fallback Strategy

### Critical Requirement: Charts Must Always Work

**Principle:** If real data is unavailable, use example/mock data so the UI and charts remain functional.

### Implementation Flow:

```
1. Try to fetch real data from API/Scraping
   ↓
2. If successful → Use real data
   ↓
3. If failed → Try cached data from localStorage
   ↓
4. If no cache → Use example data immediately
   ↓
5. Display data (real or example) with indicator
   ↓
6. Charts render with available data
```

### Example Data Requirements:

1. **Complete Coverage:** Example data must exist for ALL 11 commodities
2. **Realistic Values:** Use current market-appropriate price ranges
3. **Visual Indicators:** Clearly mark example data in UI
4. **Chart Compatibility:** Example data must work with all chart types
5. **No Empty States:** Never show "No data available" - always show example

### Example Data Display:

- **Visual Indicator Options:**
  - Small "Example" badge on price card
  - Different background color (subtle)
  - Icon indicator (info icon)
  - Text: "Example Data" in smaller font
  - Tooltip explaining it's example data

- **User Experience:**
  - Charts/graphs render normally
  - All functionality works (filtering, sorting, etc.)
  - User can still interact with UI
  - Clear but non-intrusive indication of example data

### Code Pattern:

```javascript
async function getPriceData(commodity) {
  try {
    // Try real API
    const realData = await fetchFromAPI(commodity);
    return realData;
  } catch (error) {
    // Try cache
    const cached = getCachedData(commodity);
    if (cached) return cached;
    
    // Use example data
    const example = getExampleData(commodity);
    console.log(`Using example data for ${commodity}`);
    return example;
  }
}

// Ensure all commodities have data
function ensureAllCommoditiesHaveData() {
  const commodities = ['Gold', 'Silver', 'Platinum', ...];
  commodities.forEach(commodity => {
    const data = getPriceData(commodity);
    if (!data) {
      // Force example data if somehow missing
      displayPrice(commodity, getExampleData(commodity));
    }
  });
}
```

---

## Phase 5: Special Considerations

### 5.1 Commodity-Specific Challenges

**Electricity:**
- Prices vary by region (US, EU, UK, etc.)
- May need to specify region or use average
- Units: $/MWh or £/MWh

**Gas (Natural Gas):**
- Regional pricing differences
- Units: $/MMBtu (US) or p/therm (UK)

**Rare Earths:**
- May need to track basket or individual elements (Neodymium, Dysprosium, etc.)
- **Solution:** Web scrape from public sources (Trading Economics, Investing.com)
- IEA Critical Minerals Data Explorer may have historical data

**Graphite:**
- Less liquid market, limited free API coverage
- **Solution:** Web scrape from commodity trading websites
- May need to use multiple sources and average

**Industrial Metals (Cobalt, Nickel, Lithium):**
- Often traded on LME or similar exchanges
- **Solution:** 
  - Nickel: Metals-API free tier or web scraping
  - Cobalt: Web scraping (less common in free APIs)
  - Lithium: Web scraping from battery metals websites

### 5.2 Data Normalization
- Standardize units across commodities
- Handle currency conversion if needed
- Normalize timestamps
- Handle different price formats

### 5.3 Rate Limiting (Free APIs)
- **Respect free tier rate limits strictly**
- Implement request queuing to avoid hitting limits
- Use appropriate refresh intervals (15-30 minutes for free tiers)
- Implement exponential backoff on rate limit errors
- Cache aggressively to minimize API calls
- For web scraping: Add delays between requests (respect robots.txt)
- **No paid upgrades** - must work within free tier limits

---

## Phase 6: Testing & Validation

### 6.1 Functional Testing
- [ ] All commodities display correctly (even with example data)
- [ ] Prices update automatically
- [ ] Manual refresh works
- [ ] Error handling works for API failures
- [ ] **Example data displays when real data unavailable**
- [ ] **Charts/graphs work with example data**
- [ ] Loading states display properly
- [ ] Example data indicator shows when using mock data
- [ ] Responsive design works on all screen sizes
- [ ] All 11 commodities always visible (no missing data)

### 6.2 Data Validation
- [ ] Prices are within expected ranges
- [ ] Change calculations are correct
- [ ] Timestamps are accurate
- [ ] Units are displayed correctly

### 6.3 Performance Testing
- [ ] Page load time acceptable
- [ ] API calls don't block UI
- [ ] Smooth updates without flickering
- [ ] Memory usage is reasonable

---

## Phase 7: Future Enhancements (Optional)

1. **Historical Charts:** Add mini charts showing price trends
2. **Price Alerts:** Allow users to set price alerts
3. **Comparison View:** Compare multiple commodities
4. **Export Data:** Download price data as CSV/JSON
5. **Multiple Regions:** Allow switching between regional prices
6. **Dark/Light Mode:** Theme toggle for price section
7. **Favorites:** Let users favorite specific commodities
8. **Detailed View:** Expandable cards with more information

---

## Estimated Timeline

- **Phase 1 (Research):** 1-2 days
- **Phase 2 (Design):** 1 day
- **Phase 3-4 (Implementation):** 3-5 days
- **Phase 5 (Special Cases):** 1-2 days
- **Phase 6 (Testing):** 1-2 days

**Total: 7-12 days** (depending on API selection and complexity)

---

## Recommended Tech Stack (Formbricks-Inspired)

### Core Stack (Modern Vanilla JS)
- **ES6+ JavaScript Modules** - Modern module system for clean code organization
- **TypeScript-like patterns** - Use JSDoc for type safety and better IDE support
- **Fetch API with async/await** - Modern async patterns
- **CSS Custom Properties** - Modern CSS variables for theming
- **CSS Grid/Flexbox** - Modern responsive layout
- **LocalStorage API** - For caching and persistence

### Code Organization (Formbricks-Style)
- **Modular Architecture** - Separate concerns into focused modules
- **Component-based thinking** - Even in vanilla JS, think in components
- **Utility functions** - Reusable helper functions
- **Type definitions** - JSDoc type annotations for better DX
- **Clean separation** - Data layer, business logic, and UI layer

### Modern Patterns to Adopt
- **ES6 Modules** - `import/export` for clean dependencies
- **Async/Await** - Modern promise handling
- **Error Boundaries** - Graceful error handling
- **State Management** - Simple state pattern (like React useState)
- **Event-driven** - Clean event handling
- **Debouncing/Throttling** - Performance optimization

---

## Security & Free API Considerations

1. **API Keys (Free APIs):**
   - Free APIs may not require keys (e.g., FreeGoldPrice.org)
   - For free APIs that do require keys (EIA, Metals-API):
     - Keys are less sensitive (free tier)
     - Still don't commit to version control
     - Can use environment variables or config file (gitignored)
   - For client-side only: Free API keys can be in frontend (less secure but acceptable for free tiers)

2. **CORS:**
   - Some free APIs may have CORS restrictions
   - **Solution:** Use CORS proxy services (free):
     - `https://api.allorigins.win/raw?url=`
     - `https://cors-anywhere.herokuapp.com/` (may need to request access)
     - Or use browser extension for development

3. **Rate Limiting (Free Tiers):**
   - Free APIs have strict rate limits
   - Implement client-side rate limiting
   - Cache responses aggressively
   - Use longer refresh intervals (15-30 min)
   - Implement request queuing

4. **Web Scraping Ethics:**
   - Respect robots.txt files
   - Add delays between requests (1-2 seconds minimum)
   - Don't overload servers
   - Use user-agent headers
   - Consider using CORS proxy for cross-origin requests

---

## Free Data Source Summary

### Confirmed Free Sources by Commodity:

| Commodity | Free Data Source | API Key Required? | Notes |
|-----------|-----------------|-------------------|-------|
| Gold | FreeGoldPrice.org | ❌ No | Hourly updates |
| Silver | FreeGoldPrice.org | ❌ No | Hourly updates |
| Platinum | FreeGoldPrice.org | ❌ No | Hourly updates |
| Copper | Metals-API (free tier) or Web Scraping | ✅ Yes (free) | Check current limits |
| Nickel | Metals-API (free tier) or Web Scraping | ✅ Yes (free) | Check current limits |
| Electricity | EIA API | ✅ Yes (free registration) | US data |
| Gas | EIA API | ✅ Yes (free registration) | US data |
| Lithium | Web Scraping | ❌ No | Public websites |
| Cobalt | Web Scraping | ❌ No | Public websites |
| Graphite | Web Scraping | ❌ No | Public websites |
| Rare Earths | Web Scraping or IEA Data | ❌ No | May need multiple sources |

### Web Scraping Targets (Public Data):
- Trading Economics (public commodity pages)
- Investing.com (public commodity data)
- MarketWatch (commodity sections)
- Battery metals websites (for lithium, cobalt)
- Mining industry websites (for graphite, rare earths)

---

## Next Steps

1. **Review and approve this plan**
2. **Test free APIs:**
   - Test FreeGoldPrice.org (no registration needed)
   - Register for EIA API (free)
   - Check Metals-API free tier availability
3. **Identify web scraping targets** for Lithium, Cobalt, Graphite, Rare Earths
4. **Create detailed mockup/wireframe**
5. **Begin Phase 1 implementation**
6. **Iterate based on testing and feedback**

**Important:** All data sources must be 100% free. No paid APIs or subscriptions.

