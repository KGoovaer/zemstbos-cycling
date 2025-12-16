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

  // Get all scheduled rides for active season with attendee counts
  const ridesRaw = await prisma.scheduledRide.findMany({
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
      attendees: {
        select: {
          status: true,
          userId: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
    orderBy: { rideDate: 'asc' }
  })

  // Calculate attendance breakdown for each ride
  const rides = ridesRaw.map(ride => {
    const attendingList = ride.attendees
      .filter(a => a.status === 'attending')
      .map(a => `${a.user.firstName} ${a.user.lastName}`);
    
    const maybeList = ride.attendees
      .filter(a => a.status === 'maybe')
      .map(a => `${a.user.firstName} ${a.user.lastName}`);
    
    const declinedList = ride.attendees
      .filter(a => a.status === 'declined')
      .map(a => `${a.user.firstName} ${a.user.lastName}`);
    
    return {
      ...ride,
      _count: {
        attendees: ride.attendees.length,
      },
      attendeeCounts: {
        attending: attendingList.length,
        maybe: maybeList.length,
        declined: declinedList.length,
      },
      attendeeNames: {
        attending: attendingList,
        maybe: maybeList,
        declined: declinedList,
      },
      attendees: ride.attendees.filter(a => a.userId === session.user.id)
    };
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
