'use client'

import { useState, useEffect } from 'react'
import { RouteTable } from '@/components/admin/RouteTable'
import Link from 'next/link'

interface Route {
  id: string
  name: string
  description: string | null
  distanceKm: number
  elevationM: number | null
  difficulty: string | null
  startLocation: string | null
  region: string | null
  timesRidden: number
  lastRidden: Date | null
  createdAt: Date
  _count: {
    scheduledRides: number
  }
}

export default function RoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [filteredRoutes, setFilteredRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('')
  const [minDistance, setMinDistance] = useState('')
  const [maxDistance, setMaxDistance] = useState('')

  useEffect(() => {
    fetchRoutes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    applyFilters()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routes, searchTerm, difficultyFilter, minDistance, maxDistance])

  const fetchRoutes = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/routes')
      
      if (!res.ok) {
        throw new Error('Failed to fetch routes')
      }
      
      const data = await res.json()
      setRoutes(data)
      setFilteredRoutes(data)
    } catch (err) {
      setError('Kon routes niet laden. Probeer de pagina te verversen.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...routes]

    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (route) =>
          route.name.toLowerCase().includes(search) ||
          route.region?.toLowerCase().includes(search) ||
          route.startLocation?.toLowerCase().includes(search)
      )
    }

    if (difficultyFilter) {
      filtered = filtered.filter((route) => route.difficulty === difficultyFilter)
    }

    if (minDistance) {
      filtered = filtered.filter(
        (route) => Number(route.distanceKm) >= Number(minDistance)
      )
    }

    if (maxDistance) {
      filtered = filtered.filter(
        (route) => Number(route.distanceKm) <= Number(maxDistance)
      )
    }

    setFilteredRoutes(filtered)
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/routes/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const error = await res.json()
        alert(error.error || 'Kon route niet verwijderen')
        return
      }

      setRoutes(routes.filter((route) => route.id !== id))
    } catch (err) {
      alert('Er ging iets mis bij het verwijderen van de route')
      console.error(err)
    }
  }

  const resetFilters = () => {
    setSearchTerm('')
    setDifficultyFilter('')
    setMinDistance('')
    setMaxDistance('')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center py-20">
            <div className="text-xl text-gray-600">Routes laden...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 text-lg">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Route Bibliotheek
            </h1>
            <p className="text-xl text-gray-600">
              {routes.length} routes in bibliotheek
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/admin/routes/create"
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white text-lg font-semibold rounded-lg hover:bg-green-700"
            >
              <svg
                className="w-6 h-6 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Nieuwe Route
            </Link>
            <Link
              href="/admin/routes/upload"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700"
            >
              <svg
                className="w-6 h-6 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              Upload GPX
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Filters & Zoeken
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-2">
                Zoeken
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Naam, regio, startlocatie..."
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-base font-semibold text-gray-700 mb-2">
                Moeilijkheid
              </label>
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Alle</option>
                <option value="easy">Makkelijk</option>
                <option value="medium">Gemiddeld</option>
                <option value="hard">Moeilijk</option>
              </select>
            </div>

            <div>
              <label className="block text-base font-semibold text-gray-700 mb-2">
                Min. Afstand (km)
              </label>
              <input
                type="number"
                value={minDistance}
                onChange={(e) => setMinDistance(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-base font-semibold text-gray-700 mb-2">
                Max. Afstand (km)
              </label>
              <input
                type="number"
                value={maxDistance}
                onChange={(e) => setMaxDistance(e.target.value)}
                placeholder="100"
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {(searchTerm || difficultyFilter || minDistance || maxDistance) && (
            <div className="mt-4">
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-base text-blue-600 hover:text-blue-800 font-semibold"
              >
                Filters resetten
              </button>
              <span className="ml-4 text-gray-600">
                {filteredRoutes.length} van {routes.length} routes weergegeven
              </span>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <RouteTable routes={filteredRoutes} onDelete={handleDelete} />
        </div>
      </div>
    </div>
  )
}
