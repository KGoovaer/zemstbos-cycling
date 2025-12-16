import { RideCard } from './RideCard'

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
  attendees?: Array<{ status: string }>
}

export function CalendarGrid({ rides }: { rides: Ride[] }) {
  if (rides.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-xl text-slate-800">
          Nog geen ritten gepland voor dit seizoen
        </p>
      </div>
    )
  }

  // Group rides by date
  const ridesByDate = rides.reduce((acc, ride) => {
    const dateKey = new Date(ride.rideDate).toISOString().split('T')[0]
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(ride)
    return acc
  }, {} as Record<string, Ride[]>)

  // Sort rides within each date by team
  Object.values(ridesByDate).forEach(dateRides => {
    dateRides.sort((a, b) => a.team.localeCompare(b.team))
  })

  return (
    <div className="space-y-6">
      {Object.entries(ridesByDate).map(([dateKey, dateRides]) => {
        const multipleTeams = dateRides.length > 1
        
        return (
          <div key={dateKey}>
            {multipleTeams && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🚴</span>
                  <div>
                    <p className="font-bold text-lg text-emerald-900">
                      {dateRides.length} Teams rijden deze dag!
                    </p>
                    <p className="text-emerald-700">
                      Teams: {dateRides.map(r => r.team).join(', ')} - Kies je team hieronder
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className={multipleTeams ? 'space-y-3' : ''}>
              {dateRides.map((ride) => (
                <RideCard key={ride.id} ride={ride} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
