import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { CalendarGrid } from '@/components/calendar/CalendarGrid'
import { prisma } from '@/lib/prisma'

export const metadata = {
  title: 'Seizoenskalender - Wielrijvereniging',
}

export default async function CalendarPage() {
  const session = await auth()
  
  if (!session) {
    redirect('/login')
  }

  if (!prisma) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold mb-8">Seizoenskalender</h1>
          <p className="text-xl">Database niet beschikbaar</p>
        </div>
      </div>
    )
  }

  // Get active season
  const activeSeason = await prisma.season.findFirst({
    where: { isActive: true }
  })

  if (!activeSeason) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold mb-8">Seizoenskalender</h1>
          <p className="text-xl">Geen actief seizoen op dit moment</p>
        </div>
      </div>
    )
  }

  // Get all scheduled rides for active season
  const rides = await prisma.scheduledRide.findMany({
    where: { seasonId: activeSeason.id },
    include: {
      route: {
        select: {
          name: true,
          distanceKm: true,
          elevationM: true,
          difficulty: true,
        }
      },
      _count: {
        select: { attendees: true },
      },
      attendees: session.user ? {
        where: {
          userId: session.user.id,
        },
        select: {
          status: true,
        },
      } : false,
    },
    orderBy: { rideDate: 'asc' }
  })

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="container mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-2">
          Seizoenskalender {activeSeason.year}
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          {rides.length} ritten gepland
        </p>

        <CalendarGrid rides={rides} />
      </div>
    </div>
  )
}
