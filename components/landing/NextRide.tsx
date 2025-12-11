import { ScheduledRide, Route } from '@prisma/client'
import Link from 'next/link'

type NextRideData = ScheduledRide & {
  route: Route
}

interface NextRideProps {
  ride?: NextRideData | null
}

export function NextRide({ ride }: NextRideProps) {
  if (!ride) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6">Volgende Rit</h2>
          <p className="text-xl text-gray-600">
            Er zijn momenteel geen geplande ritten. 
            Het seizoen loopt van maart tot oktober.
          </p>
        </div>
      </section>
    )
  }

  const rideDate = new Date(ride.rideDate)
  const formattedDate = rideDate.toLocaleDateString('nl-BE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-4xl font-bold text-center mb-8">
          Volgende Rit
        </h2>
        <div className="bg-blue-50 rounded-lg p-8 border-2 border-blue-200">
          <div className="text-center mb-6">
            <p className="text-2xl font-semibold text-blue-800 mb-2">
              {formattedDate}
            </p>
            <p className="text-lg text-gray-600">
              Start om {new Date(ride.startTime).toLocaleTimeString('nl-BE', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          </div>
          
          <div className="text-center">
            <h3 className="text-3xl font-bold mb-4">{ride.route.name}</h3>
            <div className="flex justify-center gap-6 text-lg mb-6 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Afstand:</span>
                <span>{ride.route.distanceKm.toString()} km</span>
              </div>
              {ride.route.elevationM && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Hoogtemeters:</span>
                  <span>{ride.route.elevationM} m</span>
                </div>
              )}
              {ride.route.difficulty && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Moeilijkheid:</span>
                  <span className="capitalize">{ride.route.difficulty}</span>
                </div>
              )}
            </div>
            {ride.route.description && (
              <p className="text-lg text-gray-700 mb-6">
                {ride.route.description}
              </p>
            )}
            {ride.notes && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <p className="text-lg">{ride.notes}</p>
              </div>
            )}
          </div>

          <div className="text-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center bg-blue-600 text-white px-8 py-4 text-xl font-semibold rounded-lg hover:bg-blue-700 min-h-touch min-w-[200px]"
            >
              Meld je aan om mee te rijden
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
