import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import Link from 'next/link'
import { getWintertoerRoute, isOffSeason } from '@/lib/winter-rides'

export async function NextRideCard() {
  if (!prisma) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <p className="text-xl text-gray-600">
          Database niet beschikbaar
        </p>
      </div>
    )
  }

  const now = new Date()
  now.setHours(0, 0, 0, 0)

  // Find next Sunday
  const nextSunday = new Date(now)
  const daysUntilSunday = (7 - nextSunday.getDay()) % 7 || 7
  nextSunday.setDate(nextSunday.getDate() + daysUntilSunday)
  
  // Check if next Sunday is in off-season and should show winter ride
  if (isOffSeason(nextSunday)) {
    // Get next scheduled ride to compare dates
    const nextScheduledRide = await prisma.scheduledRide.findFirst({
      where: {
        rideDate: { gte: now },
        status: 'scheduled'
      },
      include: {
        route: true
      },
      orderBy: {
        rideDate: 'asc'
      }
    })

    // If no scheduled ride OR next Sunday comes before the scheduled ride, show winter ride
    if (!nextScheduledRide || nextSunday < new Date(nextScheduledRide.rideDate)) {
      const winterRoute = await getWintertoerRoute()
      
      if (winterRoute) {
        const formattedDate = format(nextSunday, 'EEEE d MMMM yyyy', { locale: nl })
        
        return (
          <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 rounded-lg shadow-lg p-8 border-2 border-blue-300">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">❄️</span>
              <h2 className="text-3xl font-bold">Volgende Zondag</h2>
            </div>

            <div className="bg-white rounded-lg p-6 mb-4">
              <p className="text-2xl font-semibold text-blue-900 capitalize mb-2">
                {formattedDate}
              </p>
              <p className="text-xl text-gray-700">Start: 09:00</p>
            </div>

            <h3 className="text-4xl font-bold mb-2 text-gray-900">
              {winterRoute.name}
            </h3>
            <p className="text-lg text-blue-700 mb-6 font-semibold">
              Vaste winterrit - Elke zondag om 9u
            </p>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {winterRoute.distanceKm.toString()} km
                </div>
                <div className="text-lg text-gray-600">Afstand</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {winterRoute.elevationM || 0}m
                </div>
                <div className="text-lg text-gray-600">Hoogte</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-600 capitalize">
                  {winterRoute.difficulty === 'easy' && 'Makkelijk'}
                  {winterRoute.difficulty === 'medium' && 'Gemiddeld'}
                  {winterRoute.difficulty === 'hard' && 'Zwaar'}
                  {!winterRoute.difficulty && '-'}
                </div>
                <div className="text-lg text-gray-600">Niveau</div>
              </div>
            </div>

            <div className="bg-blue-100 border-l-4 border-blue-400 p-4 mb-6">
              <p className="text-lg">
                ℹ️ Geen inschrijving nodig - kom gewoon langs!
              </p>
            </div>

            <Link
              href="/calendar"
              className="block w-full bg-blue-600 text-white text-center px-6 py-4 text-xl font-semibold rounded-lg hover:bg-blue-700 min-h-touch"
            >
              Bekijk kalender
            </Link>
          </div>
        )
      }
    }
  }

  // If we get here, show the next scheduled ride
  const nextRide = await prisma.scheduledRide.findFirst({
    where: {
      rideDate: { gte: now },
      status: 'scheduled'
    },
    include: {
      route: true
    },
    orderBy: {
      rideDate: 'asc'
    }
  })

  if (!nextRide) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <p className="text-xl text-gray-600">
          Geen ritten gepland op dit moment
        </p>
      </div>
    )
  }

  const formattedDate = format(new Date(nextRide.rideDate), 'EEEE d MMMM yyyy', { locale: nl })
  const formattedTime = typeof nextRide.startTime === 'string'
    ? nextRide.startTime
    : format(nextRide.startTime, 'HH:mm')

  return (
    <div className="bg-blue-50 rounded-lg shadow-lg p-8 border-2 border-blue-300">
      <h2 className="text-3xl font-bold mb-4">Volgende Zondag</h2>

      <div className="bg-white rounded-lg p-6 mb-4">
        <p className="text-2xl font-semibold text-blue-900 capitalize mb-2">
          {formattedDate}
        </p>
        <p className="text-xl text-gray-700">Start: {formattedTime}</p>
      </div>

      <h3 className="text-4xl font-bold mb-6 text-gray-900">
        {nextRide.route.name}
      </h3>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-blue-600">
            {nextRide.route.distanceKm.toString()} km
          </div>
          <div className="text-lg text-gray-600">Afstand</div>
        </div>
        <div className="bg-white rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-blue-600">
            {nextRide.route.elevationM || 0}m
          </div>
          <div className="text-lg text-gray-600">Hoogte</div>
        </div>
        <div className="bg-white rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-blue-600 capitalize">
            {nextRide.route.difficulty === 'easy' && 'Makkelijk'}
            {nextRide.route.difficulty === 'medium' && 'Gemiddeld'}
            {nextRide.route.difficulty === 'hard' && 'Zwaar'}
            {!nextRide.route.difficulty && '-'}
          </div>
          <div className="text-lg text-gray-600">Niveau</div>
        </div>
      </div>

      {nextRide.notes && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <p className="text-lg">{nextRide.notes}</p>
        </div>
      )}

      <Link
        href={`/ride/${nextRide.id}`}
        className="block w-full bg-blue-600 text-white text-center px-6 py-4 text-xl font-semibold rounded-lg hover:bg-blue-700 min-h-touch"
      >
        Bekijk route details
      </Link>
    </div>
  )
}
