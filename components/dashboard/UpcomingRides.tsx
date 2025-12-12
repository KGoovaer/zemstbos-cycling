import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import Link from 'next/link'

export async function UpcomingRides() {
  if (!prisma) {
    return null
  }

  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const upcomingRides = await prisma.scheduledRide.findMany({
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
    skip: 1, // Skip the first one (already shown in NextRideCard)
    take: 4
  })

  if (upcomingRides.length === 0) {
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
              className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-lg font-semibold text-gray-900 capitalize">
                    {formattedDate}
                  </p>
                  <p className="text-lg text-gray-700 mt-1">{ride.route.name}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-lg text-blue-600 font-semibold">
                    {ride.route.distanceKm.toString()} km
                  </p>
                  <p className="text-sm text-gray-600">{formattedTime}</p>
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
