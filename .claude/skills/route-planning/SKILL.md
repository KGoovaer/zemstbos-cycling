---
name: route-planning
description: Design, upload, analyze, and manage cycling routes including GPX file processing, elevation analysis, distance calculation, and route library management. Use for route creation and optimization tasks.
allowed-tools: Read, Write, Edit, Bash
---

# Route Planning Skill

## Purpose

Manage the cycling route library including GPX file processing, route analysis, metadata management, and route optimization for club rides.

## Capabilities

### GPX File Processing
- Upload and parse GPX files
- Extract track points (lat/lon/elevation)
- Calculate total distance (Haversine formula)
- Calculate elevation gain
- Validate GPX structure
- Generate route previews

### Route Analysis
- Distance calculation
- Elevation profile generation
- Difficulty assessment
- Surface type analysis
- Points of interest identification
- Safety assessment

### Route Library Management
- Organize routes by region
- Tag routes by difficulty
- Track route usage
- Identify popular routes
- Manage route metadata
- Archive unused routes

### Route Optimization
- Suggest route combinations
- Plan progressive training routes
- Balance difficulty across season
- Ensure geographic variety
- Optimize for scenery/points of interest

## GPX File Structure

### Standard GPX Format
```xml
<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="...">
  <trk>
    <name>Route Name</name>
    <trkseg>
      <trkpt lat="50.8465" lon="4.3517">
        <ele>45.2</ele>
        <time>2024-01-15T09:00:00Z</time>
      </trkpt>
      <!-- More track points -->
    </trkseg>
  </trk>
</gpx>
```

### Required Elements
- Track points with lat/lon
- Elevation data (optional but recommended)
- Route name
- Valid XML structure

## Distance Calculation

### Haversine Formula
```javascript
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * 
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}
```

### Total Route Distance
```javascript
let totalDistance = 0
for (let i = 1; i < trackPoints.length; i++) {
  totalDistance += calculateDistance(
    trackPoints[i-1].lat,
    trackPoints[i-1].lon,
    trackPoints[i].lat,
    trackPoints[i].lon
  )
}
```

## Elevation Analysis

### Elevation Gain Calculation
```javascript
let elevationGain = 0
for (let i = 1; i < trackPoints.length; i++) {
  const elevDiff = trackPoints[i].elevation - trackPoints[i-1].elevation
  if (elevDiff > 0) {
    elevationGain += elevDiff
  }
}
```

### Elevation Profile
Generate array of elevation points with distance:
```javascript
const profile = trackPoints.map((point, index) => ({
  distance: cumulativeDistance[index],
  elevation: point.elevation
}))
```

## Difficulty Assessment

### Factors
1. **Distance**: < 60km (Easy), 60-80km (Medium), > 80km (Hard)
2. **Elevation**: < 300m (Easy), 300-600m (Medium), > 600m (Hard)
3. **Terrain**: Flat (Easy), Rolling (Medium), Mountainous (Hard)
4. **Surface**: Paved (Easy), Gravel (Medium), Mixed (Hard)

### Composite Difficulty Score
```javascript
const difficultyScore = 
  (distanceScore * 0.4) +
  (elevationScore * 0.4) +
  (terrainScore * 0.2)

// Classify: 0-33 (Easy), 34-66 (Medium), 67-100 (Hard)
```

## Route Metadata

### Essential Fields
```typescript
{
  name: string,              // "Kempen Classic"
  description: string,       // "Scenic ride through Kempen"
  distanceKm: number,        // 85.4
  elevationM: number,        // 450
  difficulty: enum,          // 'easy' | 'medium' | 'hard'
  startLocation: string,     // "Clubhouse Parking"
  region: string,            // "Kempen"
  gpxData: text,             // Full GPX XML
  timesRidden: number,       // 12
  lastRidden: date,          // 2024-05-15
}
```

## Route Library Organization

### By Region
- Kempen
- Hageland
- Vlaamse Ardennen
- Limburg
- Brabant

### By Distance
- Short (< 60km): Recovery rides
- Medium (60-80km): Standard rides
- Long (80-100km): Challenge rides
- Extra Long (> 100km): Special events

### By Difficulty
- Easy: Flat, paved, < 300m elevation
- Medium: Rolling, mixed surface, 300-600m
- Hard: Hilly, > 600m, challenging terrain

## Route Planning Workflows

### Uploading New Route
1. Receive GPX file upload
2. Validate GPX structure
3. Parse track points
4. Calculate distance and elevation
5. Generate route preview
6. Admin reviews and adds metadata
7. Save to route library

### Selecting Route for Event
1. Get week number in season
2. Query route suggestions (algorithm)
3. Review suggested routes
4. Check route details (distance, elevation)
5. Verify route not recently used
6. Assign to date
7. Add notes (coffee stops, etc.)

### Route Maintenance
1. Review route usage statistics
2. Identify underutilized routes
3. Update route metadata
4. Archive outdated routes
5. Request new route suggestions from members

## Best Practices

### File Management
1. **Naming**: Use descriptive names (region + feature)
2. **Validation**: Always validate GPX before importing
3. **Backup**: Keep original GPX files
4. **Versioning**: Track route updates
5. **Size Limits**: Limit file size (< 5MB)

### Data Quality
1. **Accuracy**: Verify distance/elevation with GPS data
2. **Completeness**: Ensure all metadata fields filled
3. **Updates**: Refresh route info if roads change
4. **Reviews**: Periodic route reviews for safety

### User Experience
1. **Previews**: Provide map preview before download
2. **Details**: Clear distance and elevation info
3. **Difficulty**: Honest difficulty ratings
4. **Notes**: Include important waypoints/stops

## Safety Considerations

### Route Validation
- Check for dangerous road sections
- Verify route is cycleable
- Identify high-traffic areas
- Note steep descents
- Mark construction zones

### Emergency Planning
- Identify bail-out points
- Note proximity to towns/services
- Mark areas with poor cell coverage
- Plan for mechanical issues
- Weather escape routes

## Integration Points

- Leaflet.js for map display
- CyclOSM for cycling-specific maps
- GPX parser library
- Database for route storage
- File storage for GPX files
