# Tekku Website Test Plan

## Test Execution Date: 2025-01-18

### Test 1: HTML Structure ✅
- [x] Title: "tekku — coding experiment" - PASS
- [x] Header with h1 - PASS
- [x] Disclaimer section present - PASS
- [x] Project section "Market Data Charting Toy" - PASS
- [x] Footer with disclaimer text - PASS

### Test 2: All 11 Commodities Load
**Expected:** All 11 commodities should display price cards
- [ ] Gold
- [ ] Silver
- [ ] Platinum
- [ ] Copper
- [ ] Lithium
- [ ] Nickel
- [ ] Cobalt
- [ ] Graphite
- [ ] Rare Earths
- [ ] Electricity
- [ ] Gas

### Test 3: Price Display
**Expected:** Each commodity shows:
- [ ] Valid price number (not 0, not NaN)
- [ ] Correct unit (USD/oz, USD/lb, USD/metric ton, etc.)
- [ ] Price formatted correctly (commas, decimals)

### Test 4: Delta/Change Display ⚠️ ISSUE FOUND
**Expected:** Change percentage should show actual values, not always 0.00%
- [ ] At least some commodities show non-zero change
- [ ] Change displays with +/- sign
- [ ] Change percentage formatted correctly
- [ ] Color coding (green for positive, red for negative)

**ISSUE:** Gold shows "+0.00 (+0.00%)" - needs investigation

### Test 5: Charts
**Expected:** Each commodity has a 24-month chart
- [ ] Chart renders (SVG visible)
- [ ] Chart shows data points
- [ ] "24 Months" label present
- [ ] Chart is responsive

### Test 6: Real vs Example Data
**Expected:** 
- [ ] Real data commodities show source (Yahoo Finance, LBMA, etc.)
- [ ] Example data commodities show "EXAMPLE" badge
- [ ] Source attribution correct

### Test 7: Refresh Button
**Expected:**
- [ ] Button is clickable
- [ ] Button text changes to "Loading..." when clicked
- [ ] Prices update after refresh
- [ ] Button re-enables after refresh

### Test 8: Last Update Timestamp
**Expected:**
- [ ] Timestamp displays after initial load
- [ ] Format is readable (e.g., "Last updated: 4 min ago")
- [ ] Updates after refresh

### Test 9: Console Errors
**Expected:** No critical JavaScript errors
- [ ] Check for uncaught exceptions
- [ ] Check for failed API calls
- [ ] Check for CORS errors

### Test 10: Network Requests
**Expected:**
- [ ] API calls return 200 status
- [ ] CORS proxy working (api.allorigins.win)
- [ ] No failed requests for working commodities

### Test 11: Responsive Design
**Expected:**
- [ ] Layout works on mobile (single column)
- [ ] Text is readable
- [ ] Buttons are clickable
- [ ] Charts scale properly

