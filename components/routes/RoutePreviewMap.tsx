'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface RoutePreviewMapProps {
  gpxData: string
  bounds: {
    minLat: number
    maxLat: number
    minLon: number
    maxLon: number
  }
}

export default function RoutePreviewMap({ gpxData, bounds }: RoutePreviewMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      scrollWheelZoom: false,
    })
    mapRef.current = map

    L.tileLayer('https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map)

    const parser = new DOMParser()
    const gpxDoc = parser.parseFromString(gpxData, 'application/xml')
    const trackPoints = gpxDoc.querySelectorAll('trkpt')

    const latLngs: L.LatLngExpression[] = []
    trackPoints.forEach((point) => {
      const lat = parseFloat(point.getAttribute('lat') || '0')
      const lon = parseFloat(point.getAttribute('lon') || '0')
      latLngs.push([lat, lon])
    })

    if (latLngs.length > 0) {
      L.polyline(latLngs, {
        color: '#2563eb',
        weight: 4,
        opacity: 0.8,
      }).addTo(map)

      const mapBounds = L.latLngBounds([
        [bounds.minLat, bounds.minLon],
        [bounds.maxLat, bounds.maxLon],
      ])
      map.fitBounds(mapBounds, { padding: [20, 20] })

      L.marker(latLngs[0], {
        icon: L.icon({
          iconUrl: '/icons/marker-start.png',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        }),
      })
        .addTo(map)
        .bindPopup('Start')

      L.marker(latLngs[latLngs.length - 1], {
        icon: L.icon({
          iconUrl: '/icons/marker-finish.png',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        }),
      })
        .addTo(map)
        .bindPopup('Finish')
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [gpxData, bounds])

  return <div ref={containerRef} className="h-96 w-full" />
}
