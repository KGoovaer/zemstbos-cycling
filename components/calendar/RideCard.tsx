'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import Link from 'next/link'

interface Ride {
  id: string
  rideDate: Date
  startTime: string
  status: string
  team: string
  notes: string | null
  route: {
    name: string
    distanceKm: number
    elevationM: number | null
    difficulty: string | null
  }
  _count?: {
    attendees: number
  }
  attendeeCounts?: {
    attending: number
    maybe: number
    declined: number
  }
  attendeeNames?: {
    attending: string[]
    maybe: string[]
    declined: string[]
  }
  attendees?: Array<{ status: string }>
  isWinterRide?: boolean
}

export function RideCard({ ride: initialRide }: { ride: Ride }) {
  const [ride, setRide] = useState(initialRide)
  const [loading, setLoading] = useState(false)

  const isPast = new Date(ride.rideDate) < new Date()
  const isCancelled = ride.status === 'cancelled'
  const isWinter = ride.isWinterRide || false
  const userStatus = ride.attendees?.[0]?.status || null

  const handleAttendance = async (status: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/rides/${ride.id}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        // Update local state optimistically
        const updatedRide = { ...ride }
        if (updatedRide.attendees) {
          updatedRide.attendees = [{ status }]
        }
        if (updatedRide._count) {
          // Increment or keep same based on previous status
          if (!userStatus) {
            updatedRide._count.attendees++
          }
        }
        setRide(updatedRide)
      }
    } catch (error) {
      console.error('Error updating attendance:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Link
      href={isWinter ? '#' : `/ride/${ride.id}`}
      className={`block bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow ${
        isCancelled ? 'opacity-60' : ''
      } ${isPast ? 'bg-slate-50' : ''} ${isWinter ? 'border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white' : ''}`}
      onClick={(e) => isWinter && e.preventDefault()}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-800">
              {format(new Date(ride.rideDate), 'EEEE d MMMM', { locale: nl })}
            </span>
            {isWinter ? (
              <span className="text-sm font-semibold px-3 py-1 rounded-full bg-cyan-100 text-cyan-800">
                ❄️ Wintertoer
              </span>
            ) : (
              <span className="text-sm font-semibold px-3 py-1 rounded-full bg-purple-100 text-purple-800">
                Team {ride.team}
              </span>
            )}
            {isCancelled && (
              <span className="text-sm font-semibold px-3 py-1 rounded-full bg-red-100 text-red-800">
                Geannuleerd
              </span>
            )}
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {ride.route.name}
          </h3>

          <div className="flex flex-wrap gap-4 text-slate-800 mb-2">
            <span className="flex items-center gap-1">
              <span className="font-semibold">📏</span>
              {ride.route.distanceKm} km
            </span>
            {ride.route.elevationM && (
              <span className="flex items-center gap-1">
                <span className="font-semibold">⛰️</span>
                {ride.route.elevationM}m
              </span>
            )}
            {ride.route.difficulty && (
              <span className="flex items-center gap-1">
                <span className="font-semibold">💪</span>
                {ride.route.difficulty}
              </span>
            )}
            <span className="flex items-center gap-1">
              <span className="font-semibold">🕐</span>
              {ride.startTime.slice(0, 5)}
            </span>
          </div>

          {ride.notes && (
            <p className="text-slate-800 text-sm mb-2">{ride.notes}</p>
          )}
        </div>
      </div>

      {!isPast && !isCancelled && !isWinter && ride._count !== undefined && (
        <div 
          className="pt-4 border-t border-slate-200"
          onClick={(e) => e.preventDefault()}
        >
          {ride.attendeeCounts && (ride.attendeeCounts.attending > 0 || ride.attendeeCounts.maybe > 0 || ride.attendeeCounts.declined > 0) && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold">👥</span>
                <span className="font-semibold text-slate-800">
                  {ride._count.attendees} {ride._count.attendees === 1 ? 'reactie' : 'reacties'}
                </span>
              </div>
              <div className="flex gap-2 text-sm">
                {ride.attendeeCounts.attending > 0 && (
                  <div
                    className={`flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full relative group ${ride.attendeeNames ? 'cursor-help' : ''}`}
                    {...(ride.attendeeNames?.attending && { title: ride.attendeeNames.attending.join(', ') })}
                  >
                    <span>✓</span>
                    <span className="font-semibold">{ride.attendeeCounts.attending}</span>
                    {ride.attendeeNames?.attending && ride.attendeeNames.attending.length > 0 && (
                      <div className="hidden group-hover:block absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-10">
                        {ride.attendeeNames.attending.join(', ')}
                        <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    )}
                  </div>
                )}
                {ride.attendeeCounts.maybe > 0 && (
                  <div
                    className={`flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full relative group ${ride.attendeeNames ? 'cursor-help' : ''}`}
                    {...(ride.attendeeNames?.maybe && { title: ride.attendeeNames.maybe.join(', ') })}
                  >
                    <span>?</span>
                    <span className="font-semibold">{ride.attendeeCounts.maybe}</span>
                    {ride.attendeeNames?.maybe && ride.attendeeNames.maybe.length > 0 && (
                      <div className="hidden group-hover:block absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-10">
                        {ride.attendeeNames.maybe.join(', ')}
                        <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    )}
                  </div>
                )}
                {ride.attendeeCounts.declined > 0 && (
                  <div
                    className={`flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full relative group ${ride.attendeeNames ? 'cursor-help' : ''}`}
                    {...(ride.attendeeNames?.declined && { title: ride.attendeeNames.declined.join(', ') })}
                  >
                    <span>✗</span>
                    <span className="font-semibold">{ride.attendeeCounts.declined}</span>
                    {ride.attendeeNames?.declined && ride.attendeeNames.declined.length > 0 && (
                      <div className="hidden group-hover:block absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-10">
                        {ride.attendeeNames.declined.join(', ')}
                        <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-slate-800">
              Kom je?
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleAttendance('attending')
              }}
              disabled={loading}
              className={`flex-1 px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                userStatus === 'attending'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-green-600 border-2 border-green-600 hover:bg-green-50'
              } disabled:opacity-50`}
            >
              ✓ Ja
            </button>
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleAttendance('maybe')
              }}
              disabled={loading}
              className={`flex-1 px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                userStatus === 'maybe'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-white text-yellow-600 border-2 border-yellow-600 hover:bg-yellow-50'
              } disabled:opacity-50`}
            >
              ? Misschien
            </button>
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleAttendance('declined')
              }}
              disabled={loading}
              className={`flex-1 px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                userStatus === 'declined'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-red-600 border-2 border-red-600 hover:bg-red-50'
              } disabled:opacity-50`}
            >
              ✗ Nee
            </button>
          </div>
        </div>
      )}

      {isWinter && !isPast && (
        <div className="mt-4 pt-4 border-t border-blue-200 text-center text-sm text-slate-800">
          ℹ️ Vaste winterrit - Geen inschrijving nodig
        </div>
      )}

      {!isPast && !isCancelled && !isWinter && ride._count && ride._count.attendees > 0 && (
        <div className="mt-2 text-center text-xs text-slate-700">
          Klik op de kaart voor meer details
        </div>
      )}
    </Link>
  )
}
