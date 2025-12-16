'use client'

import { useEffect, useState } from 'react'
import { EventForm } from '@/components/admin/EventForm'

interface Event {
  id: string
  title: string
  description: string | null
  eventDate: string
  eventTime: string | null
  location: string | null
  eventType: string | null
  _count?: {
    attendees: number
  }
}

export default function EventsManagementPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/admin/events')
      if (response.ok) {
        const data = await response.json()
        setEvents(data)
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Weet je zeker dat je dit evenement wilt verwijderen?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/events/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchEvents()
      } else {
        alert('Fout bij verwijderen van evenement')
      }
    } catch (error) {
      console.error('Error deleting event:', error)
      alert('Fout bij verwijderen van evenement')
    }
  }

  const handleEdit = (event: Event) => {
    setEditingEvent(event)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingEvent(null)
  }

  const handleFormSuccess = async () => {
    await fetchEvents()
    handleFormClose()
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
        return 'Algemeen'
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
        return 'bg-slate-100 text-gray-800 border-slate-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-xl text-slate-800">Laden...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Evenementen Beheer
            </h1>
            <p className="text-xl text-slate-800">
              Beheer club evenementen en sociale activiteiten
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-green-600 text-white text-lg font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            + Nieuw Evenement
          </button>
        </div>

        {events.length === 0 ? (
          <div className="bg-white rounded-lg shadow border border-slate-200 p-8 text-center">
            <p className="text-xl text-slate-800">Nog geen evenementen</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Maak je eerste evenement aan
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-lg shadow border border-slate-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <span
                    className={`px-3 py-1 text-sm font-semibold rounded-full border ${getEventTypeColor(
                      event.eventType
                    )}`}
                  >
                    {getEventTypeLabel(event.eventType)}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(event)}
                      className="text-blue-600 hover:text-blue-700 font-semibold"
                      title="Bewerken"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="text-red-600 hover:text-red-700 font-semibold"
                      title="Verwijderen"
                    >
                      ✗
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {event.title}
                </h3>

                <div className="space-y-2 text-slate-800">
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
                  <p className="mt-3 text-slate-800 line-clamp-3">
                    {event.description}
                  </p>
                )}

                {event._count && event._count.attendees > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <div className="flex items-center gap-2 text-green-600 font-semibold">
                      <span>👥</span>
                      <span>{event._count.attendees} aanmeldingen</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <EventForm
          event={editingEvent}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  )
}
