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
        <p className="text-xl text-gray-600">
          Nog geen ritten gepland voor dit seizoen
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {rides.map((ride) => (
        <RideCard key={ride.id} ride={ride} />
      ))}
    </div>
  )
}
