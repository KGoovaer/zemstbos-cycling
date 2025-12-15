'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewSeasonPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    startDate: '',
    endDate: '',
    isActive: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/admin/seasons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push('/admin/seasons')
      } else {
        const data = await response.json()
        setError(data.error || 'Fout bij aanmaken van seizoen')
      }
    } catch (error) {
      console.error('Error creating season:', error)
      setError('Fout bij aanmaken van seizoen')
    } finally {
      setLoading(false)
    }
  }

  const handleYearChange = (year: number) => {
    setFormData((prev) => ({
      ...prev,
      year,
      // Auto-set typical season dates if not already set
      startDate: prev.startDate || `${year}-03-01`,
      endDate: prev.endDate || `${year}-10-31`,
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link
            href="/admin/seasons"
            className="text-blue-600 hover:text-blue-800 text-lg font-semibold mb-4 inline-block"
          >
            ← Terug naar seizoenen
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Nieuw Seizoen Aanmaken
          </h1>
          <p className="text-xl text-gray-600">
            Maak een nieuw cycling seizoen aan met start en einddatum
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 text-lg">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="space-y-6">
            <div>
              <label htmlFor="year" className="block text-lg font-semibold text-gray-900 mb-2">
                Seizoen Jaar *
              </label>
              <input
                type="number"
                id="year"
                required
                min={2000}
                max={2100}
                value={formData.year}
                onChange={(e) => handleYearChange(parseInt(e.target.value))}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-gray-600 text-base mt-2">
                Het jaar waarin het seizoen plaatsvindt
              </p>
            </div>

            <div>
              <label htmlFor="startDate" className="block text-lg font-semibold text-gray-900 mb-2">
                Start Datum *
              </label>
              <input
                type="date"
                id="startDate"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-gray-600 text-base mt-2">
                Typisch de eerste zondag van maart
              </p>
            </div>

            <div>
              <label htmlFor="endDate" className="block text-lg font-semibold text-gray-900 mb-2">
                Eind Datum *
              </label>
              <input
                type="date"
                id="endDate"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-gray-600 text-base mt-2">
                Typisch de laatste zondag van oktober
              </p>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="ml-3 text-lg font-semibold text-gray-900">
                Dit seizoen direct activeren
              </label>
            </div>

            {formData.isActive && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-base">
                  ⚠️ Let op: Als je dit seizoen activeert, wordt het huidige actieve seizoen gedeactiveerd.
                </p>
              </div>
            )}
          </div>

          <div className="mt-8 flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Bezig met aanmaken...' : 'Seizoen Aanmaken'}
            </button>
            <Link
              href="/admin/seasons"
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-900 text-lg font-semibold rounded-lg hover:bg-gray-300 transition-colors text-center"
            >
              Annuleren
            </Link>
          </div>
        </form>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-blue-900 mb-3">
            💡 Tips
          </h2>
          <ul className="space-y-2 text-lg text-blue-800">
            <li>• Seizoenen lopen typisch van maart tot oktober</li>
            <li>• Je kan seizoenen van tevoren aanmaken voor planning</li>
            <li>• Alleen één seizoen kan tegelijk actief zijn</li>
            <li>• Het actieve seizoen wordt gebruikt voor nieuwe ritten</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
