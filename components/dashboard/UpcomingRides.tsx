import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import Link from 'next/link'
import { getWintertoerRoute, isOffSeason } from '@/lib/winter-rides'

export async function UpcomingRides() {
  if (!prisma) {
    return null
  }

  const now = new Date()
  now.setHours(0, 0, 0, 0)

  // Find next Sunday to check if we're in winter mode
  const nextSunday = new Date(now)
  const daysUntilSunday = (7 - nextSunday.getDay()) % 7 || 7
  nextSunday.setDate(nextSunday.getDate() + daysUntilSunday)

  // Get all upcoming scheduled rides
  const allScheduledRides = await prisma.scheduledRide.findMany({
    where: {
      rideDate: { gte: now },
      status: 'scheduled'
    },
    include: {
      route: true
    },
    orderBy: {
      rideDate: 'asc'
    },
    take: 5 // Get 5 to account for possible skipping
  })

  // Check if next Sunday is winter and comes before first scheduled ride
  const showingWinterFirst = isOffSeason(nextSunday) && 
    (allScheduledRides.length === 0 || nextSunday < new Date(allScheduledRides[0].rideDate))

  // If showing winter first, skip 1 ride (for NextRideCard), otherwise skip first scheduled
  const upcomingRides = showingWinterFirst 
    ? allScheduledRides.slice(0, 4)
    : allScheduledRides.slice(1, 5)

  // If no upcoming rides after skipping, check for winter rides
  if (upcomingRides.length === 0 && !showingWinterFirst) {
    const winterRoute = await getWintertoerRoute()
    
    if (winterRoute) {
      // Find next 4 Sundays in off-season
      const winterSundays = []
      const current = new Date(now)
      let foundSundays = 0
      
      // Start from next Sunday
      const daysUntilSunday = (7 - current.getDay()) % 7 || 7
      current.setDate(current.getDate() + daysUntilSunday)
      
      // Skip first one (shown in NextRideCard)
      current.setDate(current.getDate() + 7)
      
      while (foundSundays < 4 && foundSundays < 10) { // Max 10 weeks ahead
        if (isOffSeason(current)) {
          winterSundays.push(new Date(current))
          foundSundays++
        }
        current.setDate(current.getDate() + 7)
      }
      
      if (winterSundays.length > 0) {
        return (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Volgende Ritten</h2>
            <div className="space-y-3">
              {winterSundays.map((date) => {
                const formattedDate = format(date, 'd MMMM', { locale: nl })
                
                return (
                  <Link
                    key={date.toISOString()}
                    href="/calendar"
                    className="block p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg hover:from-blue-100 hover:to-cyan-100 transition-colors border border-blue-200"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 flex items-center gap-2">
                        <span className="text-xl">❄️</span>
                        <div>
                          <p className="text-lg font-semibold text-gray-900 capitalize">
                            {formattedDate}
                          </p>
                          <p className="text-lg text-slate-800 mt-1">{winterRoute.name}</p>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-lg text-blue-600 font-semibold">
                          {winterRoute.distanceKm.toString()} km
                        </p>
                        <p className="text-sm text-slate-800">09:00</p>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
            <Link
              href="/calendar"
              className="block mt-4 text-center text-lg text-blue-600 hover:text-blue-800 font-semibold"
            >
              Bekijk volledige kalender →
            </Link>
          </div>
        )
      }
    }
    
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">Volgende Ritten</h2>
      <div className="space-y-3">
        {upcomingRides.map((ride) => {
          const formattedDate = format(new Date(ride.rideDate), 'd MMMM', { locale: nl })
          const formattedTime = typeof ride.startTime === 'string'
            ? ride.startTime
            : format(ride.startTime, 'HH:mm')

          return (
            <Link
              key={ride.id}
              href={`/ride/${ride.id}`}
              className="block p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-lg font-semibold text-gray-900 capitalize">
                    {formattedDate}
                  </p>
                  <p className="text-lg text-slate-800 mt-1">{ride.route.name}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-lg text-blue-600 font-semibold">
                    {ride.route.distanceKm.toString()} km
                  </p>
                  <p className="text-sm text-slate-800">{formattedTime}</p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
      <Link
        href="/calendar"
        className="block mt-4 text-center text-lg text-blue-600 hover:text-blue-800 font-semibold"
      >
        Bekijk volledige kalender →
      </Link>
    </div>
  )
}
