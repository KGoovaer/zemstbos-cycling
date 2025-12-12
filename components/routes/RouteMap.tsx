'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-gpx'

interface RouteMapProps {
  routeId: string
  routeName: string
}

export function RouteMap({ routeId, routeName }: RouteMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<L.Map | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return

    let mounted = true

    async function loadMap() {
      try {
        // Fetch GPX data
        const response = await fetch(`/api/routes/${routeId}/gpx-data`)
        
        if (!response.ok) {
          throw new Error('Failed to load route data')
        }

        const { gpxData } = await response.json()

        if (!mounted) return

        // Initialize map
        const map = L.map(mapContainer.current!).setView([51.0, 4.5], 10)

        // Add CyclOSM tiles
        L.tileLayer('https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap contributors, CyclOSM'
        }).addTo(map)

        // Custom markers
        const startIcon = L.icon({
          iconUrl: '/markers/start.svg',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        })

        const finishIcon = L.icon({
          iconUrl: '/markers/finish.svg',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        })

        // Parse and display GPX
        const gpxLayer = new L.GPX(gpxData, {
          async: true,
          marker_options: {
            startIcon,
            endIcon: finishIcon,
            shadowUrl: '',
          },
          polyline_options: {
            color: '#e63946',
            weight: 4,
            opacity: 0.8,
          }
        })

        gpxLayer.on('loaded', function(e: L.LeafletEvent) {
          const target = e.target as L.GPX
          map.fitBounds(target.getBounds(), { padding: [50, 50] })
        })

        gpxLayer.on('error', function(e: L.LeafletEvent) {
          console.error('GPX loading error:', e)
          if (mounted) {
            setError('Fout bij laden van de route')
          }
        })

        gpxLayer.addTo(map)

        mapInstance.current = map
        if (mounted) {
          setLoading(false)
        }
      } catch (err) {
        console.error('Error loading map:', err)
        if (mounted) {
          setError('Fout bij laden van de kaart')
          setLoading(false)
        }
      }
    }

    loadMap()

    return () => {
      mounted = false
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  }, [routeId])

  if (error) {
    return (
      <div className="mb-6 bg-gray-100 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Routekaart</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-xl text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6 bg-gray-100 rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Routekaart</h2>
      <div className="relative w-full h-[500px] rounded-lg overflow-hidden border-2 border-gray-300">
        {loading && (
          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
              <p className="text-xl text-gray-600">Kaart laden...</p>
            </div>
          </div>
        )}
        <div ref={mapContainer} className="w-full h-full" />
      </div>
      <p className="text-lg text-gray-600 mt-2">
        Route: {routeName}
      </p>
    </div>
  )
}
