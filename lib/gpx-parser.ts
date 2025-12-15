import gpxParser from 'gpxparser'

export interface GPXMetadata {
  name: string
  distance: number
  elevationGain: number
  bounds: {
    minLat: number
    maxLat: number
    minLon: number
    maxLon: number
  }
  trackPoints: Array<{
    lat: number
    lon: number
    ele?: number
  }>
}

export function parseGPX(gpxContent: string): GPXMetadata {
  const gpx = new gpxParser()
  gpx.parse(gpxContent)

  if (!gpx.tracks || gpx.tracks.length === 0) {
    throw new Error('No tracks found in GPX file')
  }

  const track = gpx.tracks[0]
  
  if (!track.points || track.points.length === 0) {
    throw new Error('No track points found in GPX file')
  }

  const trackPoints = track.points.map((point: { lat: number; lon: number; ele?: number }) => ({
    lat: point.lat,
    lon: point.lon,
    ele: point.ele,
  }))

  const distance = track.distance.total / 1000
  const elevationGain = track.elevation.pos || 0

  const lats = trackPoints.map((p) => p.lat)
  const lons = trackPoints.map((p) => p.lon)

  return {
    name: track.name || gpx.metadata?.name || 'Unnamed Route',
    distance: Math.round(distance * 10) / 10,
    elevationGain: Math.round(elevationGain),
    bounds: {
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
      minLon: Math.min(...lons),
      maxLon: Math.max(...lons),
    },
    trackPoints,
  }
}

export function simplifyGPXForStorage(gpxContent: string): string {
  const parser = new DOMParser()
  const gpxDoc = parser.parseFromString(gpxContent, 'application/xml')
  
  const trackPoints = gpxDoc.querySelectorAll('trkpt')
  const simplified: Array<[number, number, number?]> = []
  
  trackPoints.forEach((point, index) => {
    if (index % 3 === 0 || index === trackPoints.length - 1) {
      const lat = parseFloat(point.getAttribute('lat') || '0')
      const lon = parseFloat(point.getAttribute('lon') || '0')
      const eleNode = point.querySelector('ele')
      const ele = eleNode ? parseFloat(eleNode.textContent || '0') : undefined
      
      simplified.push(ele !== undefined ? [lat, lon, ele] : [lat, lon])
    }
  })
  
  return JSON.stringify(simplified)
}

export function reconstructGPXFromSimplified(simplified: string, name: string): string {
  const points = JSON.parse(simplified)
  
  let gpx = '<?xml version="1.0" encoding="UTF-8"?>\n'
  gpx += '<gpx version="1.1" creator="Zemstbos Cycling">\n'
  gpx += '  <trk>\n'
  gpx += `    <name>${name}</name>\n`
  gpx += '    <trkseg>\n'
  
  points.forEach((point: [number, number, number?]) => {
    const [lat, lon, ele] = point
    gpx += `      <trkpt lat="${lat}" lon="${lon}">\n`
    if (ele !== undefined) {
      gpx += `        <ele>${ele}</ele>\n`
    }
    gpx += '      </trkpt>\n'
  })
  
  gpx += '    </trkseg>\n'
  gpx += '  </trk>\n'
  gpx += '</gpx>'
  
  return gpx
}

export function validateGPXFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.name.toLowerCase().endsWith('.gpx')) {
      reject(new Error('Bestand moet een .gpx extensie hebben'))
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      reject(new Error('Bestand is te groot (maximum 5MB)'))
      return
    }

    const reader = new FileReader()
    
    reader.onload = (e) => {
      const content = e.target?.result as string
      if (!content || !content.includes('<gpx')) {
        reject(new Error('Ongeldig GPX bestand'))
        return
      }
      resolve(content)
    }
    
    reader.onerror = () => {
      reject(new Error('Kon bestand niet lezen'))
    }
    
    reader.readAsText(file)
  })
}
