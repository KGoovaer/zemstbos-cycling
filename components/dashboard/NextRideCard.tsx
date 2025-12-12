import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import Link from 'next/link'

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
