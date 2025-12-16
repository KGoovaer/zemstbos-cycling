# Manual Route Creation Implementation Summary

## Overview
Routes can now be created without GPX files. This allows admins to quickly add basic route information when a GPX file is not available.

## Changes Made

### 1. Database Schema (`prisma/schema.prisma`)
- Made `gpxData` field optional (`String?` instead of `String`)
- Routes can now be created with or without GPX data

**Migration Required:**
```bash
npx prisma migrate dev --name make_gpx_optional
```

### 2. New Route Creation Page
**File:** `/app/admin/routes/create/page.tsx`

Features:
- Form for manual route entry
- Required fields: name, distance (km)
- Optional fields: description, elevation, difficulty, start location, region
- Link to GPX upload as alternative
- Validation and error handling

### 3. Updated Routes Library Page
**File:** `/app/admin/routes/page.tsx`

Changes:
- Two buttons instead of one:
  - "Nieuwe Route" (green) → Manual creation
  - "Upload GPX" (blue) → GPX upload
- Both options clearly visible to admin

### 4. New API Endpoint
**File:** `/app/api/admin/routes/route.ts`

Added `POST` method:
- Creates routes without requiring GPX data
- Validates required fields (name, distanceKm)
- Returns created route with 201 status

### 5. Updated GPX Data Endpoint
**File:** `/app/api/routes/[id]/gpx-data/route.ts`

Changes:
- Returns 404 with clear message when route has no GPX data
- Prevents errors for routes without GPX files

### 6. Updated Map Component
**File:** `/components/routes/RouteMap.tsx`

Changes:
- Handles 404 responses gracefully
- Shows "Geen GPX data beschikbaar voor deze route" message
- Doesn't try to render map when GPX is missing

### 7. Updated Stories
**Files:**
- `stories/04-admin-features/033-route-library.md`
- `stories/04-admin-features/034-gpx-upload.md`

Changes:
- Added manual route creation as primary option
- Clarified GPX upload is optional
- Updated acceptance criteria and API endpoints

### 8. Updated Kubernetes Deployment
**File:** `stories/01-foundation/005-kubernetes-deployment.md`

Changes:
- Switched from PostgreSQL to SQLite
- Database stored on external NFS/network storage
- Added PersistentVolume and PersistentVolumeClaim manifests
- Updated prerequisites and notes

## Usage Guide

### For Admins

**Creating a Route Manually:**
1. Go to `/admin/routes`
2. Click "Nieuwe Route" (green button)
3. Fill in required fields:
   - Route name
   - Distance in km
4. Optionally add:
   - Description
   - Elevation in meters
   - Difficulty (easy/medium/hard)
   - Start location
   - Region
5. Click "Route Opslaan"

**Creating a Route with GPX:**
1. Go to `/admin/routes`
2. Click "Upload GPX" (blue button)
3. Upload GPX file
4. Review extracted data
5. Edit metadata as needed
6. Click "Route Opslaan"

### For Developers

**Creating a route via API:**
```typescript
const response = await fetch('/api/admin/routes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Route Name',
    distanceKm: 50.5,
    description: 'Optional description',
    elevationM: 250,
    difficulty: 'medium',
    startLocation: 'Start Point',
    region: 'Region Name',
    gpxData: null // or GPX string if available
  })
})
```

## Testing Checklist

- [x] Route creation page loads
- [x] Form validation works (name required, distance > 0)
- [x] Route saves without GPX data
- [x] Route appears in routes library
- [ ] Route detail page handles missing GPX gracefully
- [ ] Map component shows appropriate message when no GPX
- [ ] Edit page allows adding GPX to existing route
- [ ] Database migration applies successfully

## Notes

### GPX Data Handling
- Routes without GPX:
  - No map visualization available
  - No elevation profile
  - No GPX download button
  - Distance must be entered manually
  
- Routes with GPX:
  - Full map visualization
  - Elevation profile displayed
  - GPX download available
  - Distance calculated automatically

### When to Use Each Method

**Manual Creation:**
- Quick route entry for planning
- Route info known but no GPX file available
- Importing from external sources without GPX
- Creating placeholder routes

**GPX Upload:**
- Accurate route mapping required
- Elevation data important
- Members need GPX downloads
- Route visualization needed

## Future Enhancements

Potential improvements:
1. Add GPX to existing manual routes later
2. Generate basic GPX from route description
3. Import routes from Strava/Komoot URLs
4. Bulk import from CSV with manual route data
5. Route templates for common distances
