'use client'

import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import Link from 'next/link'

interface Ride {
  id: string
  rideDate: Date
  startTime: Date
  status: string
  notes: string | null
  route: {
    name: string
    distanceKm: number
    elevationM: number | null
    difficulty: string | null
  }
}

export function CalendarGrid({ rides }: { rides: Ride[] }) {
  if (rides.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-xl text-gray-600">
          Nog geen ritten gepland voor dit seizoen
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {rides.map((ride) => {
        const isPast = new Date(ride.rideDate) < new Date()
        const isCancelled = ride.status === 'cancelled'

        return (
          <Link
            key={ride.id}
            href={`/ride/${ride.id}`}
            className={`block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 ${
              isCancelled ? 'opacity-60' : ''
            } ${isPast && !isCancelled ? 'bg-gray-50' : ''}`}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl font-bold text-blue-600">
                    {format(new Date(ride.rideDate), 'd MMM', { locale: nl })}
                  </span>
                  <span className="text-xl text-gray-600 capitalize">
                    {format(new Date(ride.rideDate), 'EEEE', { locale: nl })}
                  </span>
                  {isCancelled && (
                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded text-base font-semibold">
                      GEANNULEERD
                    </span>
                  )}
                  {isPast && ride.status === 'completed' && (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded text-base">
                      Voltooid
                    </span>
                  )}
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {ride.route.name}
                </h3>

                {ride.notes && (
                  <p className="text-lg text-gray-600 mb-2">{ride.notes}</p>
                )}
              </div>

              <div className="flex gap-6 md:gap-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {Number(ride.route.distanceKm)} km
                  </div>
                  <div className="text-base text-gray-600">Afstand</div>
                </div>

                {ride.route.elevationM && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {ride.route.elevationM}m
                    </div>
                    <div className="text-base text-gray-600">Hoogte</div>
                  </div>
                )}

                {ride.route.difficulty && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 capitalize">
                      {ride.route.difficulty === 'easy' && 'Makkelijk'}
                      {ride.route.difficulty === 'medium' && 'Gemiddeld'}
                      {ride.route.difficulty === 'hard' && 'Zwaar'}
                    </div>
                    <div className="text-base text-gray-600">Niveau</div>
                  </div>
                )}
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
