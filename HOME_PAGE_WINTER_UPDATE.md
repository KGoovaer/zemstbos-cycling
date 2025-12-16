# Home Page Winter Rides Update

## Overview
Updated the public home page (for non-logged-in users) to show Wintertoer as the next ride when it's actually the next ride during off-season.

## Changes Made

### 1. API Endpoint Update
**File:** `app/api/rides/next/route.ts`

**Enhancement:**
- Checks if next Sunday is in off-season (Nov-Feb)
- Compares next Sunday with first scheduled ride date
- Returns winter ride if next Sunday comes before any scheduled ride
- Returns virtual winter ride object matching expected structure

**Logic:**
```typescript
1. Calculate next Sunday
2. If in off-season:
   a. Get next scheduled ride
   b. If no scheduled ride OR next Sunday < scheduled ride:
      - Fetch Wintertoer route
      - Return winter ride object
   c. Otherwise return scheduled ride
3. Otherwise return scheduled ride
```

**Winter Ride Response:**
```json
{
  "id": "winter-2024-12-22",
  "rideDate": "2024-12-22T00:00:00.000Z",
  "startTime": "09:00:00",
  "status": "scheduled",
  "team": "Winter",
  "notes": "Vaste winterrit - Elke zondag om 9u tijdens het winterseizoen",
  "route": {
    "id": "...",
    "name": "Wintertoer",
    "description": "Onze vaste winterroute",
    "distanceKm": 83,
    "elevationM": 450,
    "difficulty": "medium"
  },
  "isWinterRide": true
}
```

### 2. NextRide Component Update
**File:** `components/landing/NextRide.tsx`

**Enhancements:**
- Added `isWinterRide` property to type definition
- Special winter styling with blue gradient background
- Large ❄️ snowflake icon above title
- Different subtitle: "Sluit je aan voor onze wekelijkse wintertoer"
- Blue accent colors instead of emerald/teal
- Special info box: "Vaste winterrit - Geen inschrijving nodig"

**Visual Changes:**
- **Background:** Blue gradient (from-blue-50 via-cyan-50 to-blue-50)
- **Border:** Blue (border-blue-300)
- **Stats:** Blue text (text-blue-600) instead of emerald
- **Icon:** ❄️ snowflake displayed prominently

## User Experience

### Home Page - Winter Ride Display

**Before:**
```
Volgende Rit
Sluit je aan voor onze eerstvolgende zondagrit

[Green gradient card]
📅 Zaterdag 14 maart 2026
⏰ Start om 09:00:00
A01 Zennedijk Temse
[Shows future season ride]
```

**After (During Off-Season):**
```
❄️

Volgende Rit
Sluit je aan voor onze wekelijkse wintertoer

[Blue gradient card]
📅 Zondag 22 december 2024
⏰ Start om 09:00
Wintertoer

83 km | 450m | Gemiddeld

Vaste winterrit - Elke zondag om 9u tijdens het winterseizoen

ℹ️ Vaste winterrit
Geen inschrijving nodig - kom gewoon langs elke zondag om 9:00!

🗺️ Meld je aan om de volledige route en GPX te bekijken
[Bekijk volledige route →]
```

### Home Page - Regular Season Ride

During season (March-October), shows regular rides with green gradient styling as before.

## Technical Details

### API Logic Priority
1. **First:** Check next Sunday in off-season
2. **Then:** Compare with scheduled rides
3. **Finally:** Return appropriate ride (winter or scheduled)

### Styling System
```typescript
const isWinter = ride.isWinterRide || false

// Background gradient
isWinter 
  ? 'bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 border-blue-300'
  : 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200'

// Stats color
isWinter ? 'text-blue-600' : 'text-emerald-600'

// Info box
isWinter ? 'bg-blue-50 border-blue-400' : 'bg-yellow-50 border-yellow-400'
```

### Time Formatting
Handles both string and Date startTime formats:
```typescript
const startTime = typeof ride.startTime === 'string' && ride.startTime.includes(':')
  ? ride.startTime.slice(0, 5)
  : new Date(ride.startTime).toLocaleTimeString('nl-BE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
```

## Benefits

✅ **Accurate Display** - Shows actual next ride (winter or season)
✅ **Clear Visual Distinction** - Blue theme indicates winter ride
✅ **Welcoming Message** - "No registration needed" for winter rides
✅ **Consistent UX** - Matches dashboard and calendar styling
✅ **Public Visibility** - Non-members see winter rides too

## Edge Cases Handled

1. **No scheduled rides + off-season** → Shows winter ride ✓
2. **Scheduled ride far in future** → Shows winter ride if Sunday comes first ✓
3. **Scheduled ride soon** → Shows scheduled ride ✓
4. **Not off-season** → Shows scheduled ride normally ✓
5. **No Wintertoer route** → Falls back to "Geen ritten gepland" ✓

## Integration Points

This update works seamlessly with:
- ✅ Dashboard NextRideCard (same logic)
- ✅ Calendar WinterRideCard (consistent styling)
- ✅ UpcomingRides (coordinated display)

## Testing Scenarios

### Scenario 1: December 16, 2024 (Current)
- Today: Monday, Dec 16, 2024
- Next Sunday: Dec 22, 2024 (off-season)
- First scheduled: Mar 14, 2026
- **Result:** ✅ Shows Wintertoer for Dec 22

### Scenario 2: Late February
- Today: Feb 25, 2025
- Next Sunday: Mar 2, 2025 (not off-season - March)
- First scheduled: Mar 9, 2025
- **Result:** ✅ Shows scheduled ride for Mar 9

### Scenario 3: Mid-Season (April)
- Today: Apr 15, 2025
- Next Sunday: Apr 20, 2025 (not off-season)
- First scheduled: Apr 20, 2025
- **Result:** ✅ Shows scheduled ride normally

## Performance

- **Cache:** 5 minutes (revalidate = 300)
- **Dynamic:** force-dynamic for fresh data
- **Query:** Single DB query + winter route fetch if needed
- **Overhead:** Minimal date calculations

---

**Implemented by:** Claude (GitHub Copilot CLI)  
**Date:** 2025-12-16  
**Status:** Complete and Production Ready
