'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Event {
  id: string
  title: string
  description: string | null
  eventDate: string
  eventTime: string | null
  location: string | null
  eventType: string | null
  _count: {
    attendees: number
  }
  attendees: Array<{ status: string }>
}

export default function MemberEventsPage() {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events')
      if (response.ok) {
        const data = await response.json()
        setEvents(data)
      } else if (response.status === 401) {
        router.push('/login')
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAttendance = async (eventId: string, status: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        await fetchEvents()
      }
    } catch (error) {
      console.error('Error updating attendance:', error)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('nl-BE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getEventTypeLabel = (type: string | null) => {
    switch (type) {
      case 'kickoff':
        return 'Seizoen Start'
      case 'social':
        return 'Sociaal'
      case 'meeting':
        return 'Vergadering'
      case 'closing':
        return 'Seizoen Afsluiting'
      default:
        return 'Evenement'
    }
  }

  const getEventTypeColor = (type: string | null) => {
    switch (type) {
      case 'kickoff':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'social':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'meeting':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'closing':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getUserStatus = (event: Event) => {
    return event.attendees[0]?.status || null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <p className="text-xl text-gray-600">Laden...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Aankomende Evenementen
          </h1>
          <p className="text-xl text-gray-600">
            Meld je aan voor club evenementen
          </p>
        </div>

        {events.length === 0 ? (
          <div className="bg-white rounded-lg shadow border border-gray-200 p-8 text-center">
            <p className="text-xl text-gray-600">
              Geen aankomende evenementen
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {events.map((event) => {
              const userStatus = getUserStatus(event)

              return (
                <div
                  key={event.id}
                  className="bg-white rounded-lg shadow border border-gray-200 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <span
                      className={`px-3 py-1 text-sm font-semibold rounded-full border ${getEventTypeColor(
                        event.eventType
                      )}`}
                    >
                      {getEventTypeLabel(event.eventType)}
                    </span>
                    <div className="flex items-center gap-2 text-gray-700">
                      <span className="font-medium">👥</span>
                      <span className="font-semibold">
                        {event._count.attendees} aanmeldingen
                      </span>
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    {event.title}
                  </h2>

                  <div className="space-y-2 text-lg text-gray-700 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">📅</span>
                      <span>{formatDate(event.eventDate)}</span>
                    </div>

                    {event.eventTime && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">🕐</span>
                        <span>{event.eventTime}</span>
                      </div>
                    )}

                    {event.location && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">📍</span>
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>

                  {event.description && (
                    <p className="text-gray-600 mb-4">{event.description}</p>
                  )}

                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm font-semibold text-gray-700 mb-3">
                      Kom je?
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleAttendance(event.id, 'attending')}
                        className={`flex-1 px-4 py-3 text-lg font-semibold rounded-lg transition-colors ${
                          userStatus === 'attending'
                            ? 'bg-green-600 text-white'
                            : 'bg-white text-green-600 border-2 border-green-600 hover:bg-green-50'
                        }`}
                      >
                        ✓ Ja, ik kom
                      </button>
                      <button
                        onClick={() => handleAttendance(event.id, 'maybe')}
                        className={`flex-1 px-4 py-3 text-lg font-semibold rounded-lg transition-colors ${
                          userStatus === 'maybe'
                            ? 'bg-yellow-600 text-white'
                            : 'bg-white text-yellow-600 border-2 border-yellow-600 hover:bg-yellow-50'
                        }`}
                      >
                        ? Misschien
                      </button>
                      <button
                        onClick={() => handleAttendance(event.id, 'declined')}
                        className={`flex-1 px-4 py-3 text-lg font-semibold rounded-lg transition-colors ${
                          userStatus === 'declined'
                            ? 'bg-red-600 text-white'
                            : 'bg-white text-red-600 border-2 border-red-600 hover:bg-red-50'
                        }`}
                      >
                        ✗ Nee
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
