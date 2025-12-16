'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { validateGPXFile, parseGPX } from '@/lib/gpx-parser'

interface RouteData {
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
}

export default function EditRoutePage() {
  const params = useParams()
  const routeId = params.id as string

  const [route, setRoute] = useState<RouteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [gpxFile, setGpxFile] = useState<File | null>(null)
  const [gpxContent, setGpxContent] = useState<string | null>(null)
  const [gpxMetadata, setGpxMetadata] = useState<{ distance: number; elevation: number } | null>(null)
  const [gpxError, setGpxError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    difficulty: '',
    startLocation: '',
    region: '',
  })

  useEffect(() => {
    fetchRoute()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeId])

  const fetchRoute = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/routes?search=`)
      
      if (!res.ok) {
        throw new Error('Failed to fetch route')
      }
      
      const routes = await res.json()
      const foundRoute = routes.find((r: RouteData) => r.id === routeId)
      
      if (!foundRoute) {
        setError('Route niet gevonden')
        return
      }

      setRoute(foundRoute)
      setFormData({
        name: foundRoute.name,
        description: foundRoute.description || '',
        difficulty: foundRoute.difficulty || '',
        startLocation: foundRoute.startLocation || '',
        region: foundRoute.region || '',
      })
    } catch (err) {
      setError('Kon route niet laden')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleGPXUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setGpxFile(file)
    setGpxError(null)
    setGpxMetadata(null)

    try {
      const content = await validateGPXFile(file)
      setGpxContent(content)
      
      const metadata = parseGPX(content)
      setGpxMetadata({
        distance: metadata.distance,
        elevation: metadata.elevationGain,
      })
    } catch (err) {
      setGpxError(err instanceof Error ? err.message : 'Ongeldig GPX bestand')
      setGpxFile(null)
      setGpxContent(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const payload: typeof formData & { gpxData?: string } = { ...formData }
      
      // Include GPX data if a new file was uploaded
      if (gpxContent) {
        payload.gpxData = gpxContent
      }

      const res = await fetch(`/api/admin/routes/${routeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        throw new Error('Failed to update route')
      }

      const updatedRoute = await res.json()
      
      // Update local state with new values
      setRoute(updatedRoute)
      setSaved(true)
      setSaving(false)
      
      // Reset GPX upload state
      setGpxFile(null)
      setGpxContent(null)
      setGpxMetadata(null)
    } catch (err) {
      alert('Kon route niet opslaan. Probeer opnieuw.')
      console.error(err)
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center py-20">
            <div className="text-xl text-slate-800">Route laden...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !route) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 text-lg mb-4">
              {error || 'Route niet gevonden'}
            </p>
            <Link
              href="/admin/routes"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700"
            >
              Terug naar Routes
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {saved && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-start">
              <svg
                className="w-6 h-6 text-green-600 mr-3 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-900 mb-1">
                  Route succesvol bijgewerkt!
                </h3>
                <p className="text-base text-green-800 mb-3">
                  {gpxContent ? 'Het GPX bestand is geüpload en de afstand en hoogtemeters zijn herberekend.' : 'De route metadata is bijgewerkt.'}
                </p>
                <Link
                  href="/admin/routes"
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-base font-semibold rounded-lg hover:bg-green-700"
                >
                  Terug naar Routes
                </Link>
              </div>
            </div>
          </div>
        )}
        
        <div className="mb-6">
          <Link
            href="/admin/routes"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 text-lg font-semibold mb-4"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Terug naar Routes
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Route Bewerken
          </h1>
          <p className="text-xl text-slate-800">
            {route.distanceKm} km • {route.timesRidden} keer gereden
          </p>
        </div>

        <div className="bg-white rounded-lg shadow border border-slate-200 p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Route Informatie {gpxMetadata ? '(Wordt bijgewerkt)' : '(Huidige waarden)'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-base">
            <div>
              <span className="font-semibold text-slate-800">Afstand:</span>{' '}
              <span className={gpxMetadata ? 'text-slate-700 line-through' : 'text-gray-900'}>
                {Number(route.distanceKm).toFixed(1)} km
              </span>
              {gpxMetadata && (
                <span className="text-green-600 font-semibold ml-2">
                  → {gpxMetadata.distance.toFixed(1)} km
                </span>
              )}
            </div>
            {(route.elevationM || gpxMetadata) && (
              <div>
                <span className="font-semibold text-slate-800">Hoogtemeters:</span>{' '}
                <span className={gpxMetadata ? 'text-slate-700 line-through' : 'text-gray-900'}>
                  {route.elevationM}m
                </span>
                {gpxMetadata && (
                  <span className="text-green-600 font-semibold ml-2">
                    → {gpxMetadata.elevation}m
                  </span>
                )}
              </div>
            )}
            <div>
              <span className="font-semibold text-slate-800">Keren gereden:</span>{' '}
              <span className="text-gray-900">{route.timesRidden}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-800">Laatst gereden:</span>{' '}
              <span className="text-gray-900">
                {route.lastRidden
                  ? new Date(route.lastRidden).toLocaleDateString('nl-BE', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : 'Nooit'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border border-slate-200 p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            GPX Bestand Bijwerken (Optioneel)
          </h2>
          <p className="text-base text-slate-800 mb-4">
            Upload een nieuw GPX bestand om de route bij te werken. Afstand en hoogtemeters worden automatisch herberekend.
          </p>
          
          <div>
            <label
              htmlFor="gpxFile"
              className="block text-lg font-semibold text-slate-800 mb-2"
            >
              Nieuw GPX Bestand
            </label>
            <input
              type="file"
              id="gpxFile"
              accept=".gpx"
              onChange={handleGPXUpload}
              className="w-full px-4 py-3 text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-base file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {gpxFile && !gpxError && (
              <p className="mt-2 text-base text-green-600">
                ✓ {gpxFile.name} geladen - Route wordt bijgewerkt bij opslaan
              </p>
            )}
            {gpxError && (
              <p className="mt-2 text-base text-red-600">
                ✗ {gpxError}
              </p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow border border-slate-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Route Metadata (Bewerkbaar)
          </h2>

          <div className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-lg font-semibold text-slate-800 mb-2"
              >
                Route Naam *
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-3 text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-lg font-semibold text-slate-800 mb-2"
              >
                Beschrijving
              </label>
              <textarea
                id="description"
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-3 text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Beschrijving van de route..."
              />
            </div>

            <div>
              <label
                htmlFor="startLocation"
                className="block text-lg font-semibold text-slate-800 mb-2"
              >
                Startlocatie
              </label>
              <input
                type="text"
                id="startLocation"
                value={formData.startLocation}
                onChange={(e) =>
                  setFormData({ ...formData, startLocation: e.target.value })
                }
                className="w-full px-4 py-3 text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Bijv. Parking Gemeentehuis"
              />
            </div>

            <div>
              <label
                htmlFor="region"
                className="block text-lg font-semibold text-slate-800 mb-2"
              >
                Regio
              </label>
              <input
                type="text"
                id="region"
                value={formData.region}
                onChange={(e) =>
                  setFormData({ ...formData, region: e.target.value })
                }
                className="w-full px-4 py-3 text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Bijv. Waasland, Scheldeland"
              />
            </div>

            <div>
              <label
                htmlFor="difficulty"
                className="block text-lg font-semibold text-slate-800 mb-2"
              >
                Moeilijkheid
              </label>
              <select
                id="difficulty"
                value={formData.difficulty}
                onChange={(e) =>
                  setFormData({ ...formData, difficulty: e.target.value })
                }
                className="w-full px-4 py-3 text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecteer moeilijkheid</option>
                <option value="easy">Makkelijk</option>
                <option value="medium">Gemiddeld</option>
                <option value="hard">Moeilijk</option>
              </select>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-4">
            <Link
              href="/admin/routes"
              className="px-6 py-3 text-lg font-semibold text-slate-800 bg-slate-200 rounded-lg hover:bg-gray-300"
            >
              Annuleren
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {saving ? 'Opslaan...' : 'Opslaan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
