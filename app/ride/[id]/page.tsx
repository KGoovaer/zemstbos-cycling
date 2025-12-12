import { auth } from '@/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import Link from 'next/link'
import { RouteMapPreview } from '@/components/routes/RouteMapPreview'
import { DownloadGPXButton } from '@/components/routes/DownloadGPXButton'

export async function generateMetadata({ params }: { params: { id: string } }) {
  if (!prisma) {
    return { title: 'Route Details' }
  }

  const ride = await prisma.scheduledRide.findUnique({
    where: { id: params.id },
    include: { route: true }
  })

  return {
    title: ride ? `${ride.route.name} - Route Details` : 'Route Details'
  }
}

export default async function RideDetailPage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) redirect('/login')

  if (!prisma) {
    return <div>Database connection not available</div>
  }

  const ride = await prisma.scheduledRide.findUnique({
    where: { id: params.id },
    include: {
      route: true,
      season: true
    }
  })

  if (!ride) notFound()

  const formattedDate = format(new Date(ride.rideDate), 'EEEE d MMMM yyyy', { locale: nl })
  const formattedTime = typeof ride.startTime === 'string' 
    ? ride.startTime 
    : ride.startTime.toISOString().slice(11, 16)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <Link
          href="/calendar"
          className="inline-flex items-center text-xl text-blue-600 hover:text-blue-700 mb-6"
        >
          ← Terug naar kalender
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <p className="text-2xl font-semibold text-blue-900 capitalize">
              {formattedDate}
            </p>
            <p className="text-xl text-gray-700">Start: {formattedTime}</p>
          </div>

          <h1 className="text-5xl font-bold mb-6">{ride.route.name}</h1>

          {ride.route.description && (
            <p className="text-xl text-gray-700 mb-6">{ride.route.description}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-blue-600">
                {ride.route.distanceKm.toString()} km
              </div>
              <div className="text-lg text-gray-600 mt-2">Afstand</div>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-blue-600">
                {ride.route.elevationM || 0}m
              </div>
              <div className="text-lg text-gray-600 mt-2">Hoogtemeters</div>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-blue-600 capitalize">
                {ride.route.difficulty === 'easy' && 'Makkelijk'}
                {ride.route.difficulty === 'medium' && 'Gemiddeld'}
                {ride.route.difficulty === 'hard' && 'Zwaar'}
                {!ride.route.difficulty && '-'}
              </div>
              <div className="text-lg text-gray-600 mt-2">Niveau</div>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-blue-600">
                ~{Math.round(Number(ride.route.distanceKm) / 25)}u
              </div>
              <div className="text-lg text-gray-600 mt-2">Geschatte duur</div>
            </div>
          </div>

          {ride.route.startLocation && (
            <div className="mb-6 bg-gray-50 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-2">Startlocatie</h2>
              <p className="text-xl text-gray-700">{ride.route.startLocation}</p>
            </div>
          )}

          {ride.notes && (
            <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-6">
              <h2 className="text-2xl font-bold mb-2">Opmerkingen</h2>
              <p className="text-xl text-gray-700">{ride.notes}</p>
            </div>
          )}

          <RouteMapPreview routeId={ride.route.id} routeName={ride.route.name} />

          <div className="mt-8">
            <DownloadGPXButton routeId={ride.route.id} routeName={ride.route.name} />
          </div>
        </div>
      </div>
    </div>
  )
}
