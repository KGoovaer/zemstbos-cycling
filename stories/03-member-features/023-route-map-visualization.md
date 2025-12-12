# 023 - Route Map Visualization - not yet tested

**Epic:** Member Features
**Priority:** Must
**Estimated Effort:** 16 hours
**Phase:** 2

## User Story

As a **logged-in member**
I want **to see the route displayed on an interactive map**
So that **I can visualize where the ride goes and plan accordingly**

## Description

Implement interactive map visualization using Leaflet.js and CyclOSM tiles. Display GPX track on the map with start/finish markers, allow zooming and panning, and show the route clearly optimized for cycling.

## Acceptance Criteria

- [ ] Interactive map displays on route detail page
- [ ] GPX track rendered on map
- [ ] Start marker visible
- [ ] Finish marker visible
- [ ] Map auto-fits to route bounds
- [ ] Users can zoom and pan
- [ ] CyclOSM tiles used (cycling-focused)
- [ ] Map is responsive on mobile
- [ ] Loading state while map initializes

## Technical Implementation

### Database Changes

None (reads gpxData from routes table)

### API Endpoints

- `GET /api/routes/[id]/gpx-data` - Fetch GPX data for map rendering

### Components/Pages

Create `/components/routes/RouteMap.tsx`:

```typescript
'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-gpx'

interface RouteMapProps {
  gpxData: string
  routeName: string
}

export function RouteMap({ gpxData, routeName }: RouteMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return

    // Initialize map
    const map = L.map(mapContainer.current).setView([51.0, 4.5], 10)

    // Add CyclOSM tiles
    L.tileLayer('https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors, CyclOSM'
    }).addTo(map)

    // Custom markers
    const startIcon = L.icon({
      iconUrl: '/markers/start.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    })

    const finishIcon = L.icon({
      iconUrl: '/markers/finish.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    })

    // Parse and display GPX
    const gpxLayer = new L.GPX(gpxData, {
      async: true,
      marker_options: {
        startIcon,
        endIcon: finishIcon,
        shadowUrl: null,
      },
      polyline_options: {
        color: '#e63946',
        weight: 4,
        opacity: 0.8,
      }
    })

    gpxLayer.on('loaded', function(e: any) {
      map.fitBounds(e.target.getBounds(), { padding: [50, 50] })
    })

    gpxLayer.addTo(map)

    mapInstance.current = map

    return () => {
      map.remove()
      mapInstance.current = null
    }
  }, [gpxData])

  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden border-2 border-gray-300">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  )
}
```

### Libraries/Dependencies

```json
{
  "leaflet": "^1.9.0",
  "leaflet-gpx": "^1.7.0",
  "@types/leaflet": "^1.9.0"
}
```

## Dependencies

- **Depends on:** 022 - Route Detail Page
- **Related:** 024 - Elevation Profile

## UI/UX Notes

- Map height 500px for good visibility
- Auto-fit route bounds for immediate context
- Red route line for high visibility
- Start/finish markers for orientation

## Testing Considerations

- [ ] Map renders correctly
- [ ] GPX track displays
- [ ] Markers appear
- [ ] Auto-zoom works
- [ ] Pan and zoom responsive
- [ ] Mobile friendly

## Notes

- **Tiles:** CyclOSM shows cycling infrastructure
- **Markers:** Need custom start/finish marker images in /public/markers/
