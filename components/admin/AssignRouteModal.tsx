'use client'

import { useEffect, useState } from 'react'
import { RouteSuggestions } from './RouteSuggestions'

interface Route {
  id: string
  name: string
  distanceKm: number
  elevationM?: number
  difficulty?: string
}

interface ScheduledRide {
  id: string
  rideDate: string
  team: string
  startTime: string
  status: string
  notes?: string
  weatherBackup?: string
  route: Route
  backupRoute?: Route
}

interface Props {
  date: Date
  team: string
  seasonId: string
  existingRide?: ScheduledRide | null
  onClose: () => void
  onSave: () => void
}

export function AssignRouteModal({
  date,
  team,
  seasonId,
  existingRide,
  onClose,
  onSave,
}: Props) {
  const [routes, setRoutes] = useState<Route[]>([])
  const [selectedRouteId, setSelectedRouteId] = useState<string>(
    existingRide?.route.id || ''
  )
  const [startTime, setStartTime] = useState<string>(
    existingRide?.startTime.slice(0, 5) || '09:00'
  )
  const [status, setStatus] = useState<string>(existingRide?.status || 'scheduled')
  const [notes, setNotes] = useState<string>(existingRide?.notes || '')
  const [weatherBackupId, setWeatherBackupId] = useState<string>(
    existingRide?.weatherBackup || ''
  )
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(!existingRide)

  useEffect(() => {
    fetchRoutes()
  }, [])

  const fetchRoutes = async () => {
    try {
      const response = await fetch('/api/admin/routes')
      if (response.ok) {
        const data = await response.json()
        setRoutes(data)
      }
    } catch (error) {
      console.error('Error fetching routes:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedRouteId) {
      alert('Selecteer een route')
      return
    }

    setLoading(true)

    try {
      const url = existingRide
        ? `/api/admin/schedule/${existingRide.id}`
        : '/api/admin/schedule'

      const method = existingRide ? 'PUT' : 'POST'

      const body = {
        seasonId,
        routeId: selectedRouteId,
        rideDate: date.toISOString(),
        team,
        startTime: `${startTime}:00`,
        status,
        notes: notes || null,
        weatherBackup: weatherBackupId || null,
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        onSave()
      } else {
        const error = await response.json()
        alert(error.error || 'Fout bij opslaan van rit')
      }
    } catch (error) {
      console.error('Error saving ride:', error)
      alert('Fout bij opslaan van rit')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('nl-BE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                {existingRide ? 'Rit Bewerken' : 'Rit Toevoegen'}
              </h2>
              <p className="text-xl text-slate-800 mt-1">
                {formatDate(date)} - Team {team}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-700 hover:text-slate-800 text-4xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {showSuggestions && (
            <div>
              <button
                type="button"
                onClick={() => setShowSuggestions(false)}
                className="text-blue-600 hover:text-blue-700 font-semibold text-lg mb-3"
              >
                ← Verberg suggesties
              </button>
              <RouteSuggestions
                date={date}
                seasonId={seasonId}
                team={team}
                onSelectRoute={(routeId) => {
                  setSelectedRouteId(routeId)
                  setShowSuggestions(false)
                }}
              />
            </div>
          )}

          {!showSuggestions && !existingRide && (
            <button
              type="button"
              onClick={() => setShowSuggestions(true)}
              className="w-full py-3 px-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-semibold text-lg border-2 border-blue-200"
            >
              📊 Bekijk route suggesties
            </button>
          )}

          <div>
            <label
              htmlFor="route"
              className="block text-lg font-semibold text-gray-900 mb-2"
            >
              Route *
            </label>
            <select
              id="route"
              value={selectedRouteId}
              onChange={(e) => setSelectedRouteId(e.target.value)}
              required
              className="w-full px-4 py-3 text-lg border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Selecteer een route</option>
              {routes.map((route) => (
                <option key={route.id} value={route.id}>
                  {route.name} - {route.distanceKm}km
                  {route.elevationM ? ` - ${route.elevationM}m` : ''}
                  {route.difficulty ? ` - ${route.difficulty}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="startTime"
                className="block text-lg font-semibold text-gray-900 mb-2"
              >
                Starttijd
              </label>
              <input
                type="time"
                id="startTime"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-3 text-lg border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="status"
                className="block text-lg font-semibold text-gray-900 mb-2"
              >
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-3 text-lg border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="scheduled">Gepland</option>
                <option value="cancelled">Geannuleerd</option>
                <option value="completed">Voltooid</option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="weatherBackup"
              className="block text-lg font-semibold text-gray-900 mb-2"
            >
              Slecht Weer Route (optioneel)
            </label>
            <select
              id="weatherBackup"
              value={weatherBackupId}
              onChange={(e) => setWeatherBackupId(e.target.value)}
              className="w-full px-4 py-3 text-lg border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Geen backup route</option>
              {routes.map((route) => (
                <option key={route.id} value={route.id}>
                  {route.name} - {route.distanceKm}km
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="notes"
              className="block text-lg font-semibold text-gray-900 mb-2"
            >
              Notities (optioneel)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 text-lg border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Bijv. Afspraak bij café, extra pauze..."
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-4 bg-slate-200 text-gray-900 text-xl font-semibold rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Annuleren
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-4 bg-blue-600 text-white text-xl font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Bezig...' : existingRide ? 'Opslaan' : 'Toevoegen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
