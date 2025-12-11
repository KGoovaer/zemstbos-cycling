# 024 - Elevation Profile

**Epic:** Member Features
**Priority:** Should
**Estimated Effort:** 8 hours
**Phase:** 2

## User Story

As a **logged-in member**
I want **to see an elevation profile of the route**
So that **I can understand the climbs and prepare for the effort required**

## Description

Display an elevation chart showing the route's elevation changes over distance. This helps members understand what climbs to expect and when during the ride they occur.

## Acceptance Criteria

- [ ] Elevation chart displays on route detail page
- [ ] X-axis shows distance in km
- [ ] Y-axis shows elevation in meters
- [ ] Chart is responsive
- [ ] Shows total elevation gain
- [ ] Easy to read colors and labels
- [ ] Handles routes without elevation data

## Technical Implementation

### Database Changes

None (reads from route.gpxData)

### API Endpoints

None (parses GPX on client or server)

### Components/Pages

Create `/components/routes/ElevationProfile.tsx`:

```typescript
'use client'

import { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler
)

interface ElevationPoint {
  distance: number
  elevation: number
}

export function ElevationProfile({ gpxData }: { gpxData: string }) {
  const [elevationData, setElevationData] = useState<ElevationPoint[]>([])

  useEffect(() => {
    // Parse GPX and extract elevation points
    const parser = new DOMParser()
    const gpx = parser.parseFromString(gpxData, 'text/xml')
    const trackPoints = gpx.querySelectorAll('trkpt')

    const points: ElevationPoint[] = []
    let totalDistance = 0

    trackPoints.forEach((pt, index) => {
      const ele = pt.querySelector('ele')
      if (!ele) return

      const elevation = parseFloat(ele.textContent || '0')

      if (index > 0) {
        const prevPt = trackPoints[index - 1]
        const lat1 = parseFloat(prevPt.getAttribute('lat') || '0')
        const lon1 = parseFloat(prevPt.getAttribute('lon') || '0')
        const lat2 = parseFloat(pt.getAttribute('lat') || '0')
        const lon2 = parseFloat(pt.getAttribute('lon') || '0')

        // Haversine distance
        const R = 6371 // Earth radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180
        const dLon = (lon2 - lon1) * Math.PI / 180
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
        totalDistance += R * c
      }

      points.push({ distance: totalDistance, elevation })
    })

    setElevationData(points)
  }, [gpxData])

  if (elevationData.length === 0) {
    return null
  }

  const chartData = {
    labels: elevationData.map(p => p.distance.toFixed(1)),
    datasets: [
      {
        label: 'Hoogte (m)',
        data: elevationData.map(p => p.elevation),
        fill: true,
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.parsed.y}m`,
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Afstand (km)',
          font: { size: 16 },
        },
      },
      y: {
        title: {
          display: true,
          text: 'Hoogte (m)',
          font: { size: 16 },
        },
      },
    },
  }

  return (
    <div className="bg-white rounded-lg p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4">Hoogteprofiel</h2>
      <div className="h-[300px]">
        <Line data={chartData} options={options} />
      </div>
    </div>
  )
}
```

### Libraries/Dependencies

```json
{
  "chart.js": "^4.0.0",
  "react-chartjs-2": "^5.0.0"
}
```

## Dependencies

- **Depends on:** 022 - Route Detail Page
- **Related:** 023 - Route Map

## Notes

- **Performance:** Simplify data points for long routes
- **Alternative:** Use leaflet-elevation plugin
