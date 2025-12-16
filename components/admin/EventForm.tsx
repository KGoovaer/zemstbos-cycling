'use client'

import { useState, useEffect } from 'react'

interface Event {
  id: string
  title: string
  description: string | null
  eventDate: string
  eventTime: string | null
  location: string | null
  eventType: string | null
}

interface Props {
  event?: Event | null
  onClose: () => void
  onSuccess: () => void
}

export function EventForm({ event, onClose, onSuccess }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [eventTime, setEventTime] = useState('')
  const [location, setLocation] = useState('')
  const [eventType, setEventType] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (event) {
      setTitle(event.title)
      setDescription(event.description || '')
      setEventDate(new Date(event.eventDate).toISOString().split('T')[0])
      setEventTime(event.eventTime || '')
      setLocation(event.location || '')
      setEventType(event.eventType || '')
    }
  }, [event])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !eventDate) {
      alert('Titel en datum zijn verplicht')
      return
    }

    setLoading(true)

    try {
      const url = event
        ? `/api/admin/events/${event.id}`
        : '/api/admin/events'

      const method = event ? 'PUT' : 'POST'

      const body = {
        title,
        description: description || null,
        eventDate,
        eventTime: eventTime || null,
        location: location || null,
        eventType: eventType || null,
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        onSuccess()
      } else {
        const error = await response.json()
        alert(error.error || 'Fout bij opslaan van evenement')
      }
    } catch (error) {
      console.error('Error saving event:', error)
      alert('Fout bij opslaan van evenement')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-gray-900">
              {event ? 'Evenement Bewerken' : 'Nieuw Evenement'}
            </h2>
            <button
              onClick={onClose}
              className="text-slate-700 hover:text-slate-800 text-4xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block text-lg font-semibold text-gray-900 mb-2"
            >
              Titel *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-3 text-lg border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Bijv. Seizoen Opening 2025"
            />
          </div>

          <div>
            <label
              htmlFor="eventType"
              className="block text-lg font-semibold text-gray-900 mb-2"
            >
              Type Evenement
            </label>
            <select
              id="eventType"
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full px-4 py-3 text-lg border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Algemeen</option>
              <option value="kickoff">Seizoen Start</option>
              <option value="social">Sociaal</option>
              <option value="meeting">Vergadering</option>
              <option value="closing">Seizoen Afsluiting</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="eventDate"
                className="block text-lg font-semibold text-gray-900 mb-2"
              >
                Datum *
              </label>
              <input
                type="date"
                id="eventDate"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                required
                className="w-full px-4 py-3 text-lg border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="eventTime"
                className="block text-lg font-semibold text-gray-900 mb-2"
              >
                Tijd (optioneel)
              </label>
              <input
                type="time"
                id="eventTime"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                className="w-full px-4 py-3 text-lg border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="location"
              className="block text-lg font-semibold text-gray-900 mb-2"
            >
              Locatie (optioneel)
            </label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-3 text-lg border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Bijv. Clubhuis, Marktplein"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-lg font-semibold text-gray-900 mb-2"
            >
              Beschrijving (optioneel)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 text-lg border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Extra informatie over het evenement..."
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
              {loading ? 'Bezig...' : event ? 'Opslaan' : 'Toevoegen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
