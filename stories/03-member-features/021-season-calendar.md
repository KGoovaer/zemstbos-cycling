# 021 - Season Calendar

**Epic:** Member Features
**Priority:** Must
**Estimated Effort:** 12 hours
**Phase:** 2

## User Story

As a **logged-in member**
I want **to view the full season calendar with all scheduled rides**
So that **I can plan my schedule and see what rides are coming up**

## Description

Create a calendar view showing all scheduled rides for the active season. Members can see dates, routes, distances, and click through to route details. The calendar should be easy to scan and understand for older users.

## Acceptance Criteria

- [ ] Calendar displays all rides for active season
- [ ] Each ride shows date, route name, and distance
- [ ] Rides are sorted chronologically
- [ ] Can click on ride to see full details
- [ ] Shows ride status (scheduled, cancelled, completed)
- [ ] Mobile-friendly list view for small screens
- [ ] Loading states while fetching data
- [ ] Handles empty calendar gracefully

## Technical Implementation

### Database Changes

None (reads from scheduled_rides and routes tables)

### API Endpoints

- `GET /api/calendar` - Fetch all scheduled rides for active season

### Components/Pages

Create `/app/(member)/calendar/page.tsx`:

```typescript
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { CalendarGrid } from '@/components/calendar/CalendarGrid'
import { prisma } from '@/lib/prisma'

export const metadata = {
  title: 'Seizoenskalender - Wielrijvereniging',
}

export default async function CalendarPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

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
      }
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
```

Create `/components/calendar/CalendarGrid.tsx`:

```typescript
'use client'

import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import Link from 'next/link'

interface Ride {
  id: string
  rideDate: Date
  startTime: string
  status: string
  notes: string | null
  route: {
    name: string
    distanceKm: number
    elevationM: number | null
    difficulty: string | null
  }
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
      {rides.map((ride) => {
        const isPast = new Date(ride.rideDate) < new Date()
        const isCancelled = ride.status === 'cancelled'

        return (
          <Link
            key={ride.id}
            href={`/ride/${ride.id}`}
            className={`block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 ${
              isCancelled ? 'opacity-60' : ''
            } ${isPast && !isCancelled ? 'bg-gray-50' : ''}`}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl font-bold text-blue-600">
                    {format(new Date(ride.rideDate), 'd MMM', { locale: nl })}
                  </span>
                  <span className="text-xl text-gray-600 capitalize">
                    {format(new Date(ride.rideDate), 'EEEE', { locale: nl })}
                  </span>
                  {isCancelled && (
                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded text-base font-semibold">
                      GEANNULEERD
                    </span>
                  )}
                  {isPast && ride.status === 'completed' && (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded text-base">
                      Voltooid
                    </span>
                  )}
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {ride.route.name}
                </h3>

                {ride.notes && (
                  <p className="text-lg text-gray-600 mb-2">{ride.notes}</p>
                )}
              </div>

              <div className="flex gap-6 md:gap-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {ride.route.distanceKm} km
                  </div>
                  <div className="text-base text-gray-600">Afstand</div>
                </div>

                {ride.route.elevationM && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {ride.route.elevationM}m
                    </div>
                    <div className="text-base text-gray-600">Hoogte</div>
                  </div>
                )}

                {ride.route.difficulty && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 capitalize">
                      {ride.route.difficulty === 'easy' && 'Makkelijk'}
                      {ride.route.difficulty === 'medium' && 'Gemiddeld'}
                      {ride.route.difficulty === 'hard' && 'Zwaar'}
                    </div>
                    <div className="text-base text-gray-600">Niveau</div>
                  </div>
                )}
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
```

## Dependencies

- **Depends on:** 003 - Authentication, 002 - Database Schema
- **Related:** 022 - Route Detail Page

## UI/UX Notes

- Large date display for easy scanning
- Clear visual distinction for past/cancelled rides
- Mobile-first responsive design
- High contrast for accessibility

## Testing Considerations

- [ ] Shows all scheduled rides
- [ ] Rides sorted chronologically
- [ ] Past rides visually distinguished
- [ ] Cancelled rides marked clearly
- [ ] Links to route details work
- [ ] Mobile layout works well
- [ ] Handles empty calendar

## Notes

- **Performance:** Server-side rendering for fast initial load
- **Filtering:** Future enhancement could add month/status filters
