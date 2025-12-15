'use client'

import { useMemo, useState } from 'react'

interface Season {
  id: string
  year: number
  startDate: string
  endDate: string
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

interface Props {
  season: Season
  team: string
  scheduledRides: ScheduledRide[]
  onAddRide: (date: Date) => void
  onEditRide: (ride: ScheduledRide) => void
  onDeleteRide: (rideId: string) => void
}

export function ScheduleCalendar({
  season,
  team,
  scheduledRides,
  onAddRide,
  onEditRide,
  onDeleteRide,
}: Props) {
  // Get list of months in season
  const availableMonths = useMemo(() => {
    const start = new Date(season.startDate)
    const end = new Date(season.endDate)
    const months: string[] = []

    const current = new Date(start)
    while (current <= end) {
      const monthKey = `${current.getFullYear()}-${current.getMonth()}`
      months.push(monthKey)
      current.setMonth(current.getMonth() + 1)
      current.setDate(1)
    }

    return months
  }, [season])

  // Default to current month if in season, otherwise first month
  const getCurrentMonthKey = () => {
    const now = new Date()
    const currentKey = `${now.getFullYear()}-${now.getMonth()}`
    if (availableMonths.includes(currentKey)) {
      return currentKey
    }
    return availableMonths[0] || ''
  }

  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthKey())

  // Generate calendar for selected month
  const calendarDays = useMemo(() => {
    if (!selectedMonth) return []

    const [year, month] = selectedMonth.split('-').map(Number)
    const firstDayOfMonth = new Date(year, month, 1)
    
    // Start from Monday of the week containing the first day
    const startOfWeek = new Date(firstDayOfMonth)
    const dayOfWeek = firstDayOfMonth.getDay()
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Monday = 0 days back, Sunday = 6 days back
    startOfWeek.setDate(firstDayOfMonth.getDate() - daysToSubtract)
    
    // Generate 6 weeks worth of days
    const days: Date[] = []
    for (let i = 0; i < 42; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      days.push(day)
    }

    return days
  }, [selectedMonth])

  const getRideForDate = (date: Date) => {
    return scheduledRides.find((ride) => {
      const rideDate = new Date(ride.rideDate)
      return (
        rideDate.getFullYear() === date.getFullYear() &&
        rideDate.getMonth() === date.getMonth() &&
        rideDate.getDate() === date.getDate()
      )
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  const isInSeason = (date: Date) => {
    const seasonStart = new Date(season.startDate)
    const seasonEnd = new Date(season.endDate)
    return date >= seasonStart && date <= seasonEnd
  }

  const isWeekend = (date: Date) => {
    const day = date.getDay()
    return day === 0 || day === 6 // Sunday or Saturday
  }

  const weekDayNames = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo']

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('nl-BE', {
      month: 'long',
      year: 'numeric',
    })
  }

  const getSelectedMonthName = () => {
    if (!selectedMonth) return ''
    const [year, month] = selectedMonth.split('-').map(Number)
    const date = new Date(year, month, 1)
    return getMonthName(date)
  }

  const getSelectedMonthDate = () => {
    if (!selectedMonth) return null
    const [year, month] = selectedMonth.split('-').map(Number)
    return new Date(year, month, 1)
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Seizoenskalender {season.year} - Team {team}
      </h2>

      <div className="mb-6">
        <label
          htmlFor="month-select"
          className="block text-lg font-semibold text-gray-900 mb-2"
        >
          Maand selecteren
        </label>
        <select
          id="month-select"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="w-full md:w-auto px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {availableMonths.map((monthKey) => {
            const [year, month] = monthKey.split('-').map(Number)
            const date = new Date(year, month, 1)
            const monthName = date.toLocaleDateString('nl-BE', {
              month: 'long',
              year: 'numeric',
            })
            return (
              <option key={monthKey} value={monthKey}>
                {monthName}
              </option>
            )
          })}
        </select>
      </div>

      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          💡 <strong>Tip:</strong> Klik op een willekeurige dag om een rit toe te voegen. 
          Weekenden zijn gemarkeerd voor makkelijke herkenning.
        </p>
      </div>

      {selectedMonth && calendarDays.length > 0 ? (
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            {getSelectedMonthName()}
          </h3>

          {/* Week day headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {weekDayNames.map((day) => (
              <div
                key={day}
                className="text-center font-semibold text-sm text-gray-600 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((date) => {
              const ride = getRideForDate(date)
              const isPast = date < new Date()
              const inSeason = isInSeason(date)
              const selectedMonthDate = getSelectedMonthDate()
              const isCurrentMonth = selectedMonthDate ? date.getMonth() === selectedMonthDate.getMonth() : false
              const weekend = isWeekend(date)

                return (
                  <div
                    key={date.toISOString()}
                    className={`
                      relative border-2 rounded-lg p-2 min-h-[100px] flex flex-col
                      ${!isCurrentMonth ? 'opacity-30' : ''}
                      ${ride ? getStatusColor(ride.status) : ''}
                      ${!ride && inSeason && !isPast ? 'bg-white border-gray-300 hover:border-blue-400 hover:shadow-md cursor-pointer' : ''}
                      ${!ride && isPast ? 'bg-gray-50 border-gray-200' : ''}
                      ${!ride && !inSeason ? 'bg-gray-100 border-gray-300' : ''}
                      ${weekend && !ride && inSeason && !isPast ? 'border-blue-300 bg-blue-50' : ''}
                      transition-all
                    `}
                    onClick={() => {
                      if (!ride && inSeason && !isPast) {
                        onAddRide(date)
                      }
                    }}
                  >
                    {/* Date number */}
                    <div className="flex items-start justify-between mb-1">
                      <span
                        className={`
                          text-lg font-bold
                          ${weekend ? 'text-blue-600' : 'text-gray-900'}
                          ${!isCurrentMonth ? 'text-gray-400' : ''}
                        `}
                      >
                        {date.getDate()}
                      </span>
                      {ride && (
                        <span
                          className={`px-1.5 py-0.5 text-xs font-semibold rounded ${
                            ride.status === 'scheduled'
                              ? 'bg-green-600 text-white'
                              : ride.status === 'cancelled'
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-600 text-white'
                          }`}
                        >
                          {ride.status === 'scheduled' ? '✓' : ride.status === 'cancelled' ? '✗' : '○'}
                        </span>
                      )}
                    </div>

                    {/* Ride content or add prompt */}
                    {ride ? (
                      <div className="flex-1 flex flex-col text-xs">
                        <p className="font-semibold text-gray-900 line-clamp-2 mb-1">
                          {ride.route.name}
                        </p>
                        <div className="text-gray-700 space-y-0.5">
                          <div>{ride.route.distanceKm} km</div>
                          <div>{ride.startTime.slice(0, 5)}</div>
                        </div>
                        <div className="mt-auto pt-2 flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onEditRide(ride)
                            }}
                            className="flex-1 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                          >
                            ✎
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onDeleteRide(ride.id)
                            }}
                            className="flex-1 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                          >
                            ✗
                          </button>
                        </div>
                      </div>
                    ) : inSeason && !isPast ? (
                      <div className="flex-1 flex items-center justify-center text-gray-400">
                        <div className="text-2xl">+</div>
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-600">
            <p className="text-xl">Geen kalender gevonden voor dit seizoen</p>
          </div>
        )}
    </div>
  )
}
