'use client'

import { useEffect, useState } from 'react'

interface Route {
  id: string
  name: string
  distanceKm: number
  elevationM?: number
  difficulty?: string
  timesRidden: number
  lastRidden?: string
}

interface SuggestedRoute extends Route {
  score: number
  reason: string
}

interface Props {
  date: Date
  seasonId: string
  team: string
  onSelectRoute: (routeId: string) => void
}

export function RouteSuggestions({
  date,
  seasonId,
  team,
  onSelectRoute,
}: Props) {
  const [suggestions, setSuggestions] = useState<SuggestedRoute[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSuggestions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, seasonId, team])

  const fetchSuggestions = async () => {
    setLoading(true)
    try {
      // Calculate week number within the season (March = week 1)
      const marchFirst = new Date(date.getFullYear(), 2, 1)
      const weekNumber = Math.ceil((date.getTime() - marchFirst.getTime()) / (7 * 24 * 60 * 60 * 1000))

      // Fetch all routes
      const routesResponse = await fetch('/api/admin/routes')
      if (!routesResponse.ok) {
        throw new Error('Failed to fetch routes')
      }
      const routes: Route[] = await routesResponse.json()

      // Fetch scheduled rides for this season
      const ridesResponse = await fetch(
        `/api/admin/schedule?seasonId=${seasonId}&team=${team}`
      )
      if (!ridesResponse.ok) {
        throw new Error('Failed to fetch scheduled rides')
      }
      const scheduledRides = await ridesResponse.json()
      const scheduledRouteIds = scheduledRides.map((r: { routeId: string }) => r.routeId)

      // Filter out already scheduled routes
      const availableRoutes = routes.filter(
        (route) => !scheduledRouteIds.includes(route.id)
      )

      // Score routes based on various factors
      const scoredRoutes: SuggestedRoute[] = availableRoutes.map((route) => {
        let score = 50 // Base score
        const reasons: string[] = []

        // Team-based distance preferences
        const teamDistancePreferences = {
          A: { min: 70, ideal: 85, max: 120 },
          B: { min: 50, ideal: 65, max: 80 },
          C: { min: 30, ideal: 45, max: 60 },
        }

        const prefs = teamDistancePreferences[team as keyof typeof teamDistancePreferences]
        const distance = route.distanceKm

        if (distance >= prefs.min && distance <= prefs.max) {
          const deviation = Math.abs(distance - prefs.ideal)
          const distanceScore = Math.max(0, 30 - deviation)
          score += distanceScore
          if (distance >= prefs.ideal - 5 && distance <= prefs.ideal + 5) {
            reasons.push('Ideale afstand voor team')
          }
        } else {
          score -= 20
          reasons.push(
            distance < prefs.min ? 'Te kort voor team' : 'Te lang voor team'
          )
        }

        // Popularity score
        if (route.timesRidden > 5) {
          score += 15
          reasons.push('Populaire route')
        } else if (route.timesRidden < 2) {
          score += 10
          reasons.push('Weinig gereden, tijd voor variatie')
        }

        // Last ridden bonus (variety)
        if (route.lastRidden) {
          const daysSinceRidden = Math.floor(
            (date.getTime() - new Date(route.lastRidden).getTime()) /
              (1000 * 60 * 60 * 24)
          )
          if (daysSinceRidden > 365) {
            score += 20
            reasons.push('Meer dan een jaar geleden')
          } else if (daysSinceRidden > 180) {
            score += 10
            reasons.push('Lang geleden gereden')
          } else if (daysSinceRidden < 30) {
            score -= 15
            reasons.push('Recent gereden')
          }
        } else {
          score += 15
          reasons.push('Nog nooit gereden')
        }

        // Difficulty matching (early season = easier, mid-season = harder)
        if (route.difficulty && weekNumber) {
          if (weekNumber <= 4 && route.difficulty === 'Gemakkelijk') {
            score += 10
            reasons.push('Goed voor begin seizoen')
          } else if (
            weekNumber > 8 &&
            weekNumber < 24 &&
            (route.difficulty === 'Moeilijk' || route.difficulty === 'Gemiddeld')
          ) {
            score += 10
            reasons.push('Uitdaging voor mid-seizoen')
          }
        }

        return {
          ...route,
          score: Math.max(0, Math.min(100, score)),
          reason: reasons.join(', ') || 'Standaard route',
        }
      })

      // Sort by score and take top 5
      const topSuggestions = scoredRoutes
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)

      setSuggestions(topSuggestions)
    } catch (error) {
      console.error('Error fetching suggestions:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          🤖 Route Suggesties
        </h3>
        <p className="text-slate-800">Suggesties worden geladen...</p>
      </div>
    )
  }

  if (suggestions.length === 0) {
    return (
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          🤖 Route Suggesties
        </h3>
        <p className="text-slate-800">
          Geen suggesties beschikbaar. Alle routes zijn al gepland of er zijn geen
          routes beschikbaar.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        🤖 Route Suggesties voor Team {team}
      </h3>
      <p className="text-slate-800 mb-4">
        Op basis van historische data en team voorkeuren:
      </p>

      <div className="space-y-3">
        {suggestions.map((route, index) => (
          <button
            key={route.id}
            onClick={() => onSelectRoute(route.id)}
            className="w-full text-left bg-white border-2 border-blue-300 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl font-bold text-blue-600">
                    #{index + 1}
                  </span>
                  <h4 className="text-lg font-bold text-gray-900">
                    {route.name}
                  </h4>
                </div>

                <div className="flex flex-wrap gap-3 mb-2 text-slate-800">
                  <span className="font-medium">📏 {route.distanceKm} km</span>
                  {route.elevationM && (
                    <span className="font-medium">⛰️ {route.elevationM}m</span>
                  )}
                  {route.difficulty && (
                    <span className="font-medium">💪 {route.difficulty}</span>
                  )}
                  <span className="font-medium">
                    🔄 {route.timesRidden}x gereden
                  </span>
                </div>

                <p className="text-sm text-slate-800 italic">{route.reason}</p>
              </div>

              <div className="ml-4">
                <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {route.score}%
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
