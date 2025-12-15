'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { GPXMetadata } from '@/lib/gpx-parser'

const MapComponent = dynamic(
  () => import('@/components/routes/RoutePreviewMap'),
  { ssr: false }
)

interface RoutePreviewProps {
  gpxData: string
  metadata: GPXMetadata
  routeName: string
  description?: string
  difficulty?: string
  startLocation?: string
  region?: string
}

export function RoutePreview({
  gpxData,
  metadata,
  routeName,
  description,
  difficulty,
  startLocation,
  region,
}: RoutePreviewProps) {
  const [showMap, setShowMap] = useState(false)

  useEffect(() => {
    setShowMap(true)
  }, [])

  const difficultyLabels: Record<string, string> = {
    easy: 'Makkelijk',
    medium: 'Gemiddeld',
    hard: 'Moeilijk',
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Route Preview
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Route Informatie
            </h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-base font-medium text-gray-600">Naam</dt>
                <dd className="text-lg text-gray-900">{routeName}</dd>
              </div>
              {description && (
                <div>
                  <dt className="text-base font-medium text-gray-600">
                    Beschrijving
                  </dt>
                  <dd className="text-base text-gray-900">{description}</dd>
                </div>
              )}
              {startLocation && (
                <div>
                  <dt className="text-base font-medium text-gray-600">
                    Startlocatie
                  </dt>
                  <dd className="text-base text-gray-900">{startLocation}</dd>
                </div>
              )}
              {region && (
                <div>
                  <dt className="text-base font-medium text-gray-600">Regio</dt>
                  <dd className="text-base text-gray-900">{region}</dd>
                </div>
              )}
            </dl>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Route Details
            </h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-base font-medium text-gray-600">
                  Afstand
                </dt>
                <dd className="text-lg font-semibold text-blue-600">
                  {metadata.distance} km
                </dd>
              </div>
              <div>
                <dt className="text-base font-medium text-gray-600">
                  Hoogtemeters
                </dt>
                <dd className="text-lg font-semibold text-green-600">
                  {metadata.elevationGain} m
                </dd>
              </div>
              {difficulty && (
                <div>
                  <dt className="text-base font-medium text-gray-600">
                    Moeilijkheid
                  </dt>
                  <dd className="text-base text-gray-900">
                    {difficultyLabels[difficulty] || difficulty}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-base font-medium text-gray-600">
                  Track Points
                </dt>
                <dd className="text-base text-gray-900">
                  {metadata.trackPoints.length}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Route Kaart
          </h3>
          <div className="bg-gray-100 rounded-lg overflow-hidden border border-gray-300">
            {showMap ? (
              <MapComponent gpxData={gpxData} bounds={metadata.bounds} />
            ) : (
              <div className="h-96 flex items-center justify-center">
                <p className="text-gray-500">Kaart laden...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
