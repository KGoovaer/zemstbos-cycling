import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { CalendarGrid } from '@/components/calendar/CalendarGrid'
import { WinterRideCard } from '@/components/calendar/WinterRideCard'
import { prisma } from '@/lib/prisma'
import { generateOffSeasonRides } from '@/lib/winter-rides'

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

  // If no active season, show off-season rides only
  if (!activeSeason) {
    const now = new Date()
    const currentYear = now.getFullYear()
    const startDate = new Date(currentYear - 1, 10, 1) // November 1st previous year
    const endDate = new Date(currentYear + 1, 2, 28) // End of February next year
    
    const winterRides = await generateOffSeasonRides(startDate, endDate)
    
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            Wintertoer Kalender
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Geen actief seizoen - Wintertoer ritten worden getoond
          </p>

          <WinterRideCard 
            winterSundayCount={winterRides.length}
            seasonYear={currentYear}
          />
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
  const seasonRides = ridesRaw.map(ride => {
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

  // Generate off-season rides for current year
  const now = new Date()
  const currentYear = now.getFullYear()
  const winterStartDate = new Date(currentYear, 10, 1) // November 1st
  const winterEndDate = new Date(currentYear + 1, 2, 28) // End of February next year
  
  const winterRides = await generateOffSeasonRides(winterStartDate, winterEndDate)
  
  // Filter out winter rides that overlap with scheduled season rides
  const seasonDates = new Set(
    seasonRides.map(r => new Date(r.rideDate).toISOString().split('T')[0])
  )
  
  const filteredWinterRides = winterRides.filter(wr => {
    const dateStr = wr.rideDate.toISOString().split('T')[0]
    return !seasonDates.has(dateStr)
  })

  const winterCount = filteredWinterRides.length
  
  // Get first season ride date for winter card display
  const firstSeasonRide = seasonRides.length > 0 ? seasonRides[0] : null

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="container mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-2">
          Seizoenskalender {activeSeason.year}
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          {seasonRides.length} seizoensritten gepland
        </p>

        {winterCount > 0 && (
          <div className="mb-8">
            <WinterRideCard 
              winterSundayCount={winterCount}
              seasonYear={activeSeason.year}
              firstSeasonRideDate={firstSeasonRide?.rideDate}
            />
          </div>
        )}

        <CalendarGrid rides={seasonRides} />
      </div>
    </div>
  )
}
