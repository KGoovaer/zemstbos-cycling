'use client'

import { useState, useEffect } from 'react'
import { DownloadGPXButton } from '@/components/routes/DownloadGPXButton'
import { RouteMapPreview } from '@/components/routes/RouteMapPreview'
import { ElevationProfile } from '@/components/routes/ElevationProfile'

interface WinterRideCardProps {
  winterSundayCount: number
  seasonYear?: number
  firstSeasonRideDate?: Date
}

interface WinterRoute {
  id: string
  name: string
  distanceKm: number
  elevationM: number | null
  difficulty: string | null
  startLocation: string | null
}

function WinterRouteDetails({ routeId }: { routeId: string }) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-3">Route Kaart</h4>
        <RouteMapPreview routeId={routeId} routeName="Wintertoer" />
      </div>
      
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-3">Hoogteprofiel</h4>
        <ElevationProfile routeId={routeId} />
      </div>
    </div>
  )
}

export function WinterRideCard({ winterSundayCount, seasonYear, firstSeasonRideDate }: WinterRideCardProps) {
  const [route, setRoute] = useState<WinterRoute | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    async function fetchWinterRoute() {
      try {
        const response = await fetch('/api/routes/wintertoer')
        if (response.ok) {
          const data = await response.json()
          setRoute(data.route)
        }
      } catch (error) {
        console.error('Error fetching Wintertoer route:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchWinterRoute()
  }, [])

  // Calculate Sundays until first season ride
  const getSundaysUntilSeason = () => {
    if (!firstSeasonRideDate) {
      return winterSundayCount // Fallback to total count
    }

    const now = new Date()
    now.setHours(0, 0, 0, 0)
    
    const firstRideDate = new Date(firstSeasonRideDate)
    firstRideDate.setHours(0, 0, 0, 0)

    // Count Sundays from now until first ride
    let count = 0
    const current = new Date(now)
    
    // Start from next Sunday
    const daysUntilSunday = (7 - current.getDay()) % 7 || 7
    current.setDate(current.getDate() + daysUntilSunday)
    
    while (current < firstRideDate) {
      count++
      current.setDate(current.getDate() + 7)
    }
    
    return count
  }

  const sundaysUntilSeason = getSundaysUntilSeason()

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-blue-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-blue-100 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (!route) {
    return null
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 border-2 border-blue-300 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">❄️</span>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                Wintertoer - Vaste Zondagrit
              </h3>
              <p className="text-sm text-blue-800 font-semibold">
                {firstSeasonRideDate ? (
                  <>
                    {sundaysUntilSeason} {sundaysUntilSeason === 1 ? 'zondag' : 'zondagen'} tot start seizoen
                  </>
                ) : (
                  <>
                    {winterSundayCount} {winterSundayCount === 1 ? 'zondag' : 'zondagen'} om 9:00
                    {seasonYear && ` (${seasonYear})`}
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur rounded-lg p-4 mb-4">
            <p className="text-lg text-slate-800 mb-3">
              <strong>Elke zondag om 9:00</strong> tijdens het winterseizoen (november t/m februari)
            </p>
            
            <div className="flex flex-wrap gap-4 text-slate-800 mb-2">
              <span className="flex items-center gap-2 text-lg">
                <span className="font-semibold">📏</span>
                <strong>{route.distanceKm} km</strong>
              </span>
              {route.elevationM && (
                <span className="flex items-center gap-2 text-lg">
                  <span className="font-semibold">⛰️</span>
                  <strong>{route.elevationM}m</strong>
                </span>
              )}
              {route.difficulty && (
                <span className="flex items-center gap-2 text-lg">
                  <span className="font-semibold">💪</span>
                  <strong className="capitalize">{route.difficulty}</strong>
                </span>
              )}
            </div>

            {route.startLocation && (
              <p className="text-slate-800 mt-2">
                📍 <strong>Start:</strong> {route.startLocation}
              </p>
            )}
          </div>

          {/* Expandable Details */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-blue-600 hover:text-blue-700 font-semibold text-sm mb-3 flex items-center gap-2"
          >
            {showDetails ? '▼' : '▶'} {showDetails ? 'Verberg details' : 'Toon route details'}
          </button>

          {showDetails && (
            <div className="bg-white/70 backdrop-blur rounded-lg p-4 mb-4 border border-blue-200 space-y-4">
              <WinterRouteDetails routeId={route.id} />
              
              <div className="pt-3 border-t border-blue-200">
                <DownloadGPXButton 
                  routeId={route.id} 
                  routeName={route.name}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-100 border-l-4 border-blue-400 p-3 rounded text-sm text-slate-800">
        <p className="font-semibold">ℹ️ Vaste winterrit</p>
        <p className="mt-1">
          Geen inschrijving nodig - kom gewoon langs!
        </p>
      </div>
    </div>
  )
}
