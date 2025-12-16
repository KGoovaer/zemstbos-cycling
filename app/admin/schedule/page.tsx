'use client'

import { useEffect, useState } from 'react'
import { ScheduleCalendar } from '@/components/admin/ScheduleCalendar'
import { AssignRouteModal } from '@/components/admin/AssignRouteModal'

interface Season {
  id: string
  year: number
  startDate: string
  endDate: string
  isActive: boolean
}

interface ScheduledRide {
  id: string
  rideDate: string
  team: string
  startTime: string
  status: string
  notes?: string
  route: {
    id: string
    name: string
    distanceKm: number
    elevationM?: number
    difficulty?: string
  }
  backupRoute?: {
    id: string
    name: string
    distanceKm: number
  }
}

export default function ScheduleManagementPage() {
  const [seasons, setSeasons] = useState<Season[]>([])
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null)
  const [selectedTeam, setSelectedTeam] = useState<string>('A')
  const [scheduledRides, setScheduledRides] = useState<ScheduledRide[]>([])
  const [loading, setLoading] = useState(true)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [editingRide, setEditingRide] = useState<ScheduledRide | null>(null)

  useEffect(() => {
    fetchSeasons()
  }, [])

  useEffect(() => {
    if (selectedSeason) {
      fetchScheduledRides()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSeason, selectedTeam])

  const fetchSeasons = async () => {
    try {
      const response = await fetch('/api/admin/seasons')
      if (response.ok) {
        const data = await response.json()
        setSeasons(data)
        const activeSeason = data.find((s: Season) => s.isActive)
        if (activeSeason) {
          setSelectedSeason(activeSeason.id)
        } else if (data.length > 0) {
          setSelectedSeason(data[0].id)
        }
      }
    } catch (error) {
      console.error('Error fetching seasons:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchScheduledRides = async () => {
    try {
      const params = new URLSearchParams({
        seasonId: selectedSeason!,
        team: selectedTeam,
      })
      const response = await fetch(`/api/admin/schedule?${params}`)
      if (response.ok) {
        const data = await response.json()
        setScheduledRides(data)
      }
    } catch (error) {
      console.error('Error fetching scheduled rides:', error)
    }
  }

  const handleAddRide = (date: Date) => {
    setSelectedDate(date)
    setEditingRide(null)
    setShowAssignModal(true)
  }

  const handleEditRide = (ride: ScheduledRide) => {
    setEditingRide(ride)
    setSelectedDate(new Date(ride.rideDate))
    setShowAssignModal(true)
  }

  const handleSaveRide = async () => {
    await fetchScheduledRides()
    setShowAssignModal(false)
    setSelectedDate(null)
    setEditingRide(null)
  }

  const handleDeleteRide = async (rideId: string) => {
    if (!confirm('Weet je zeker dat je deze rit wilt verwijderen?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/schedule/${rideId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchScheduledRides()
      } else {
        alert('Fout bij verwijderen van rit')
      }
    } catch (error) {
      console.error('Error deleting ride:', error)
      alert('Fout bij verwijderen van rit')
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Planning Beheer
          </h1>
          <p className="text-xl text-slate-800">
            Beheer de rittenkalender per team
          </p>
        </div>

        <div className="bg-white rounded-lg shadow border border-slate-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="season"
                className="block text-lg font-semibold text-gray-900 mb-2"
              >
                Seizoen
              </label>
              <select
                id="season"
                value={selectedSeason || ''}
                onChange={(e) => setSelectedSeason(e.target.value)}
                className="w-full px-4 py-3 text-lg border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecteer seizoen</option>
                {seasons.map((season) => (
                  <option key={season.id} value={season.id}>
                    Seizoen {season.year}
                    {season.isActive ? ' (Actief)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="team"
                className="block text-lg font-semibold text-gray-900 mb-2"
              >
                Team
              </label>
              <select
                id="team"
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="w-full px-4 py-3 text-lg border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="A">Team A (Snel & Lang)</option>
                <option value="B">Team B (Gemiddeld)</option>
                <option value="C">Team C (Rustig)</option>
              </select>
            </div>
          </div>
        </div>

        {selectedSeason ? (
          <ScheduleCalendar
            season={seasons.find((s) => s.id === selectedSeason)!}
            team={selectedTeam}
            scheduledRides={scheduledRides}
            onAddRide={handleAddRide}
            onEditRide={handleEditRide}
            onDeleteRide={handleDeleteRide}
          />
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-800 text-lg">
              Selecteer een seizoen om de planning te bekijken
            </p>
          </div>
        )}
      </div>

      {showAssignModal && selectedDate && selectedSeason && (
        <AssignRouteModal
          date={selectedDate}
          team={selectedTeam}
          seasonId={selectedSeason}
          existingRide={editingRide}
          onClose={() => {
            setShowAssignModal(false)
            setSelectedDate(null)
            setEditingRide(null)
          }}
          onSave={handleSaveRide}
        />
      )}
    </div>
  )
}
