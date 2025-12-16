'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CreateRoutePage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    distanceKm: '',
    elevationM: '',
    difficulty: '',
    startLocation: '',
    region: '',
  })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      setError('Route naam is verplicht')
      return
    }

    if (!formData.distanceKm || Number(formData.distanceKm) <= 0) {
      setError('Afstand moet groter zijn dan 0 km')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/routes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          distanceKm: Number(formData.distanceKm),
          elevationM: formData.elevationM ? Number(formData.elevationM) : null,
          difficulty: formData.difficulty || null,
          startLocation: formData.startLocation.trim() || null,
          region: formData.region.trim() || null,
          gpxData: null,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Fout bij opslaan route')
      }

      const route = await res.json()
      router.push('/admin/routes')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon route niet opslaan')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link
              href="/admin/routes"
              className="text-blue-600 hover:text-blue-800 font-semibold text-lg"
            >
              ← Terug naar Routes
            </Link>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Nieuwe Route Aanmaken
          </h1>
          <p className="text-xl text-gray-600">
            Voer route informatie handmatig in (zonder GPX bestand)
          </p>
          <div className="mt-4">
            <Link
              href="/admin/routes/upload"
              className="text-blue-600 hover:text-blue-800 font-semibold text-base"
            >
              Of upload een GPX bestand →
            </Link>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Route Details
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">
                  Route Naam <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Bijvoorbeeld: Zennedijk - Temse - Weert"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-2">
                    Afstand (km) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    name="distanceKm"
                    value={formData.distanceKm}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.1"
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="50.0"
                  />
                </div>

                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-2">
                    Hoogtemeters (m)
                  </label>
                  <input
                    type="number"
                    name="elevationM"
                    value={formData.elevationM}
                    onChange={handleInputChange}
                    min="0"
                    step="1"
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="250"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-2">
                    Moeilijkheid
                  </label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecteer moeilijkheid</option>
                    <option value="easy">Makkelijk</option>
                    <option value="medium">Gemiddeld</option>
                    <option value="hard">Moeilijk</option>
                  </select>
                </div>

                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-2">
                    Startlocatie
                  </label>
                  <input
                    type="text"
                    name="startLocation"
                    value={formData.startLocation}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Bijvoorbeeld: Zennedijk"
                  />
                </div>
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">
                  Regio
                </label>
                <input
                  type="text"
                  name="region"
                  value={formData.region}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Bijvoorbeeld: Waasland"
                />
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">
                  Beschrijving
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Optionele beschrijving van de route..."
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <svg
                  className="h-6 w-6 text-red-600 mr-3 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-base text-red-800">{error}</p>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-8 py-4 bg-green-600 text-white text-xl font-bold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Route Opslaan...' : 'Route Opslaan'}
            </button>
            <Link
              href="/admin/routes"
              className="px-8 py-4 bg-gray-200 text-gray-700 text-xl font-bold rounded-lg hover:bg-gray-300 text-center"
            >
              Annuleren
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
