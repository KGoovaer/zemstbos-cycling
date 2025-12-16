# Winter Rides Implementation Summary

## Overview
Implemented automatic winter ride display that shows a single 'Wintertoer' card for every Sunday at 9:00 during the off-season (November through February). Members can view route details, elevation profile, and download GPX directly from the card.

## Implementation Details

### Files Created

1. **`lib/winter-rides.ts`** - Winter ride management utilities
   - `getWintertoerRoute()` - Fetches the Wintertoer route from database
   - `isOffSeason()` - Determines if a date is in off-season (Nov-Feb)
   - `generateOffSeasonRides()` - Generates virtual winter rides for Sundays
   - Counts winter Sundays for display

2. **`components/calendar/WinterRideCard.tsx`** - Single winter ride card component
   - Displays consolidated winter ride information
   - Shows route details (distance, elevation, difficulty)
   - Expandable route map and elevation profile
   - GPX download functionality
   - Blue gradient styling with snowflake badge

3. **`app/api/routes/wintertoer/route.ts`** - API endpoint for Wintertoer route
   - Fetches Wintertoer route details from database
   - Returns route metadata for display

### Files Modified

1. **`app/calendar/page.tsx`** - Calendar page
   - Imports WinterRideCard component
   - Shows single winter card when no active season exists
   - Shows winter card above season rides when season is active
   - Counts off-season Sundays for display

2. **`components/calendar/RideCard.tsx`** - Ride card component
   - Added `isWinterRide` property (kept for backward compatibility)
   - No longer used for winter rides - replaced by WinterRideCard

3. **`components/dashboard/NextRideCard.tsx`** - Dashboard next ride display
   - Checks for winter rides when no scheduled rides exist
   - Shows Wintertoer as next ride if next Sunday is in off-season
   - Special winter styling with snowflake icon
   - Links to calendar instead of ride detail page

4. **`components/dashboard/UpcomingRides.tsx`** - Dashboard upcoming rides list
   - Shows upcoming winter Sundays when no scheduled rides
   - Displays up to 4 upcoming winter rides
   - Winter rides styled with blue gradient
   - Links to calendar for more details

### Files with Documentation

1. **`WINTER_RIDES_IMPLEMENTATION.md`** - This file

## Features Implemented

✅ **Automatic Winter Schedule**
- Generates rides for every Sunday during off-season
- Uses Wintertoer route from database
- Fixed time: 9:00 AM (09:00)
- Covers November through February

✅ **Smart Calendar Integration**
- Shows winter rides when no active season
- Combines winter and season rides when season is active
- Prevents overlap with scheduled season rides
- Sorted chronologically

✅ **Visual Distinction**
- Single consolidated winter card with blue gradient background
- "❄️ Wintertoer" badge with Sunday count
- Expandable route details (map, elevation profile)
- GPX download button
- Info message: "Vaste winterrit - Geen inschrijving nodig"

✅ **Automatic Off-Season Detection**
- November (month 10) through February (month 1)
- Works across year boundaries
- No manual configuration required

## How It Works

### Off-Season Detection
```typescript
function isOffSeason(date: Date): boolean {
  const month = date.getMonth() // 0-11
  return month >= 10 || month <= 1 // Nov-Feb
}
```

### Winter Ride Generation
1. Fetch Wintertoer route from database
2. Generate rides for all Sundays in date range
3. Filter to only include off-season dates
4. Create virtual ride objects with:
   - Unique ID: `winter-YYYY-MM-DD`
   - Fixed time: 09:00
   - Team: "Winter"
   - Route: Wintertoer
   - Notes: "Wintertoer - elke zondag om 9u"

### Calendar Integration
- **No active season**: Shows only winter rides
- **Active season**: Shows both, filtered for overlap
- Season rides take precedence over winter rides on same date

## Database Requirements

### Wintertoer Route
Must exist in routes table with name containing "Wintertoer":
```sql
SELECT id, name, distance_km FROM routes 
WHERE name LIKE '%Wintertoer%';
```

Current route:
- ID: `6e9bfc1b-b6d4-49d8-a493-c18b50196382`
- Name: `Wintertoer`
- Distance: `83.0 km`

## User Experience

### Calendar View (Off-Season)
```
Wintertoer Kalender
X winterritten - Elke zondag om 9u
🔵 Geen actief seizoen - Wintertoer ritten worden getoond

[Winter Ride Cards with ❄️ badge]
```

### Calendar View (In-Season)
```
Seizoenskalender 2026
Y seizoensritten gepland + X winterritten
❄️ Wintertoer elke zondag om 9u (buiten seizoen)

[Mixed Season and Winter Ride Cards]
```

### Winter Ride Card (Single Consolidated View)
```
┌──────────────────────────────────────────────────┐
│ ❄️ Wintertoer - Vaste Zondagrit                  │
│    16 zondagen om 9:00 (2026)                    │
│                                                  │
│ Elke zondag om 9:00 tijdens het winterseizoen   │
│ (november t/m februari)                          │
│                                                  │
│ 📏 83 km  ⛰️ 450m  💪 Medium                    │
│ 📍 Start: Zemst Bos                              │
│                                                  │
│ ▶ Toon route details                             │
│   [When expanded: Map + Elevation + GPX Download]│
│                                                  │
│ ────────────────────────────────────────────     │
│ ℹ️ Vaste winterrit                               │
│    Geen inschrijving nodig - kom gewoon langs!   │
└──────────────────────────────────────────────────┘
```

## Technical Details

### Single Card Display
Winter rides shown as one consolidated card:
- Counts total off-season Sundays
- Displays route metadata from database
- Expandable details with map and elevation
- GPX download functionality
- No individual ride cards needed

### Performance
- Minimal overhead: Only generates 8-16 rides per year
- Calculated server-side
- No additional database queries during normal operation
- Cached with page data

### Date Range
Current implementation generates winter rides for:
- Start: November 1st of previous year
- End: February 28/29 of next year
- Ensures full coverage around current date

## Configuration

### Customization Options

**Change winter ride time:**
```typescript
// In lib/winter-rides.ts, line 52
startTime: '09:00:00', // Change to desired time
```

**Change off-season months:**
```typescript
// In lib/winter-rides.ts, line 27
return month >= 10 || month <= 1 // Modify month ranges
```

**Change winter route:**
Update database or modify query:
```typescript
// In lib/winter-rides.ts, line 15
where: {
  name: {
    contains: 'Wintertoer' // Change route name filter
  }
}
```

## Future Enhancements

Potential improvements not in scope:
- ✨ Allow admins to skip specific winter Sundays
- ✨ Multiple winter routes (rotation)
- ✨ Winter ride attendance tracking
- ✨ Weather-based cancellation notifications
- ✨ Winter ride statistics
- ✨ Custom winter ride start times per date

## Testing

### Verify Winter Rides Display
1. Set system date to off-season (Nov-Feb)
2. Navigate to `/calendar`
3. Verify winter rides appear for Sundays
4. Verify winter badge and styling

### Verify Season Integration
1. Create active season with rides
2. Navigate to `/calendar`
3. Verify both season and winter rides show
4. Verify winter rides don't overlap with season rides

### Verify Off-Season Mode
1. Deactivate all seasons
2. Navigate to `/calendar`
3. Verify "Wintertoer Kalender" header
4. Verify only winter rides display

## Troubleshooting

### Winter Rides Not Showing
**Cause:** Wintertoer route not found in database  
**Solution:** Verify route exists with correct name

**Cause:** Date range calculation issue  
**Solution:** Check console for errors in winter-rides.ts

### Wrong Dates Showing
**Cause:** Off-season detection incorrect  
**Solution:** Verify `isOffSeason()` logic matches requirements

### Overlap with Season Rides
**Cause:** Filtering not working  
**Solution:** Check date string comparison in calendar/page.tsx

## Migration Notes

No database migration required:
- Uses existing routes table
- No new schema changes
- Virtual rides only

## Deployment Checklist

- [x] Wintertoer route exists in production database
- [x] Route name matches filter in code
- [x] Build passes successfully
- [x] TypeScript compilation successful
- [x] No new dependencies required

---

**Implemented by:** Claude (GitHub Copilot CLI)  
**Date:** 2025-12-16  
**Feature:** Winter Rides Auto-Schedule  
**Status:** Complete and Production Ready
