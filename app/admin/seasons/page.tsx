'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Season {
  id: string
  year: number
  startDate: string
  endDate: string
  isActive: boolean
  createdAt: string
}

export default function SeasonsPage() {
  const [seasons, setSeasons] = useState<Season[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSeasons()
  }, [])

  const fetchSeasons = async () => {
    try {
      const response = await fetch('/api/admin/seasons')
      if (response.ok) {
        const data = await response.json()
        setSeasons(data)
      } else {
        console.error('Failed to fetch seasons')
      }
    } catch (error) {
      console.error('Error fetching seasons:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleActivate = async (seasonId: string) => {
    if (!confirm('Weet je zeker dat je dit seizoen wilt activeren? Het huidige actieve seizoen wordt gedeactiveerd.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/seasons/${seasonId}/activate`, {
        method: 'PUT',
      })

      if (response.ok) {
        await fetchSeasons()
      } else {
        alert('Fout bij activeren van seizoen')
      }
    } catch (error) {
      console.error('Error activating season:', error)
      alert('Fout bij activeren van seizoen')
    }
  }

  const handleDelete = async (seasonId: string) => {
    if (!confirm('Weet je zeker dat je dit seizoen wilt verwijderen? Dit kan alleen als er geen ritten zijn gepland.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/seasons/${seasonId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchSeasons()
      } else {
        const error = await response.json()
        alert(error.error || 'Fout bij verwijderen van seizoen')
      }
    } catch (error) {
      console.error('Error deleting season:', error)
      alert('Fout bij verwijderen van seizoen')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-xl text-gray-600">Laden...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Seizoen Beheer
            </h1>
            <p className="text-xl text-gray-600">
              Beheer cycling seizoenen en activeer het huidige seizoen
            </p>
          </div>
          <Link
            href="/admin/seasons/new"
            className="px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Nieuw Seizoen
          </Link>
        </div>

        {seasons.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-800 text-lg mb-4">
              Er zijn nog geen seizoenen aangemaakt.
            </p>
            <Link
              href="/admin/seasons/new"
              className="inline-block px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Maak je eerste seizoen aan
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-lg font-bold text-gray-900">
                    Jaar
                  </th>
                  <th className="px-6 py-4 text-left text-lg font-bold text-gray-900">
                    Start Datum
                  </th>
                  <th className="px-6 py-4 text-left text-lg font-bold text-gray-900">
                    Eind Datum
                  </th>
                  <th className="px-6 py-4 text-left text-lg font-bold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-lg font-bold text-gray-900">
                    Acties
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {seasons.map((season) => (
                  <tr key={season.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-lg text-gray-900 font-semibold">
                      {season.year}
                    </td>
                    <td className="px-6 py-4 text-lg text-gray-600">
                      {new Date(season.startDate).toLocaleDateString('nl-BE', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-lg text-gray-600">
                      {new Date(season.endDate).toLocaleDateString('nl-BE', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4">
                      {season.isActive ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                          ✓ Actief
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-600">
                          Inactief
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {!season.isActive && (
                        <button
                          onClick={() => handleActivate(season.id)}
                          className="px-4 py-2 bg-green-600 text-white text-base font-semibold rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Activeer
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(season.id)}
                        className="px-4 py-2 bg-red-600 text-white text-base font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={season.isActive}
                      >
                        Verwijder
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-blue-900 mb-3">
            ℹ️ Seizoen Informatie
          </h2>
          <ul className="space-y-2 text-lg text-blue-800">
            <li>• Een seizoen loopt typisch van maart tot oktober (8 maanden)</li>
            <li>• Slechts één seizoen kan tegelijk actief zijn</li>
            <li>• Het actieve seizoen wordt gebruikt voor nieuwe geplande ritten</li>
            <li>• Seizoenen met ritten kunnen niet verwijderd worden</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
