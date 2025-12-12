# 011 - Ride Teaser - Done

**Epic:** Public Features
**Priority:** Must
**Estimated Effort:** 4 hours
**Phase:** 2

## User Story

As a **visitor to the website**
I want **to see a preview of the next upcoming ride**
So that **I can get a taste of what the club offers before joining**

## Description

Display a teaser of the next scheduled Sunday ride on the landing page. This gives potential members a preview of what to expect and shows that the club is active. The teaser shows basic information (date, route name, distance) but requires login to see full details.

## Acceptance Criteria

- [ ] Next upcoming ride is fetched from database
- [ ] Ride date displayed prominently
- [ ] Route name displayed
- [ ] Distance (km) displayed
- [ ] Clear message if no upcoming rides scheduled
- [ ] "Login to see details" call-to-action if not authenticated
- [ ] Links to login page
- [ ] Component updates when ride date changes
- [ ] Handles loading and error states gracefully

## Technical Implementation

### Database Changes

None (uses existing scheduled_rides and routes tables)

### API Endpoints

Create `/app/api/rides/next/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const now = new Date()
    now.setHours(0, 0, 0, 0) // Start of today

    const nextRide = await prisma.scheduledRide.findFirst({
      where: {
        rideDate: {
          gte: now
        },
        status: 'scheduled'
      },
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
      orderBy: {
        rideDate: 'asc'
      }
    })

    if (!nextRide) {
      return NextResponse.json({
        message: 'Geen ritten gepland op dit moment'
      }, { status: 404 })
    }

    // Return limited info for public (full details require auth)
    return NextResponse.json({
      date: nextRide.rideDate,
      startTime: nextRide.startTime,
      routeName: nextRide.route.name,
      distance: nextRide.route.distanceKm,
      elevation: nextRide.route.elevationM,
      difficulty: nextRide.route.difficulty,
    })
  } catch (error) {
    console.error('Error fetching next ride:', error)
    return NextResponse.json(
      { error: 'Fout bij ophalen van rit' },
      { status: 500 }
    )
  }
}
```

### Components/Pages

Create `/components/landing/NextRide.tsx`:

```typescript
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'

interface NextRideData {
  date: string
  startTime: string
  routeName: string
  distance: number
  elevation: number
  difficulty: string
}

export function NextRide() {
  const [ride, setRide] = useState<NextRideData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/rides/next')
      .then(res => res.json())
      .then(data => {
        if (data.error || data.message) {
          setError(true)
        } else {
          setRide(data)
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xl">Laden...</p>
        </div>
      </section>
    )
  }

  if (error || !ride) {
    return (
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Volgende Rit</h2>
          <p className="text-xl text-gray-600">
            Geen ritten gepland op dit moment
          </p>
          <p className="text-lg text-gray-500 mt-2">
            Neem contact op met de club voor meer informatie
          </p>
        </div>
      </section>
    )
  }

  const rideDate = new Date(ride.date)
  const formattedDate = format(rideDate, 'EEEE d MMMM yyyy', { locale: nl })

  return (
    <section className="py-12 bg-white border-y-4 border-blue-600">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-8">
          Volgende Rit
        </h2>

        <div className="max-w-2xl mx-auto bg-blue-50 rounded-lg p-8 border-2 border-blue-200">
          <div className="text-center mb-6">
            <p className="text-2xl font-semibold text-blue-900 capitalize">
              {formattedDate}
            </p>
            <p className="text-xl text-gray-700 mt-1">
              Start: {ride.startTime}
            </p>
          </div>

          <h3 className="text-3xl font-bold text-center mb-6 text-gray-900">
            {ride.routeName}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="text-center bg-white rounded-lg p-4 shadow">
              <div className="text-3xl font-bold text-blue-600">
                {ride.distance} km
              </div>
              <div className="text-lg text-gray-600 mt-1">Afstand</div>
            </div>

            <div className="text-center bg-white rounded-lg p-4 shadow">
              <div className="text-3xl font-bold text-blue-600">
                {ride.elevation}m
              </div>
              <div className="text-lg text-gray-600 mt-1">Hoogtemeters</div>
            </div>

            <div className="text-center bg-white rounded-lg p-4 shadow">
              <div className="text-3xl font-bold text-blue-600 capitalize">
                {ride.difficulty === 'easy' && 'Makkelijk'}
                {ride.difficulty === 'medium' && 'Gemiddeld'}
                {ride.difficulty === 'hard' && 'Zwaar'}
              </div>
              <div className="text-lg text-gray-600 mt-1">Niveau</div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-lg text-gray-700 mb-4">
              Meld je aan om de volledige route te zien
            </p>
            <Link
              href="/login"
              className="inline-block bg-blue-600 text-white px-8 py-4 text-xl font-semibold rounded-lg hover:bg-blue-700 min-h-touch"
            >
              Aanmelden om meer te zien
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
```

### Libraries/Dependencies

```json
{
  "date-fns": "^2.30.0"
}
```

## Dependencies

- **Depends on:** 002 - Database Schema, 010 - Landing Page
- **Related:** 020 - Member Dashboard (shows full details after login)

## UI/UX Notes

**Design Principles:**
- Eye-catching section with border to draw attention
- Large, readable text for date and route name
- Clear stats displayed in easy-to-scan cards
- Prominent call-to-action to log in
- Use of color to create visual interest

**Accessibility:**
- High contrast between text and background
- Large font sizes throughout
- Clear visual hierarchy
- Descriptive labels for stats

**Error States:**
- Graceful handling when no rides scheduled
- Helpful message suggesting to contact club
- No technical error messages shown to users

## Testing Considerations

- [ ] Displays next upcoming ride correctly
- [ ] Shows correct date in Dutch format
- [ ] Distance and elevation display correctly
- [ ] Difficulty level translates to Dutch
- [ ] Login button links to /login
- [ ] Handles case when no rides scheduled
- [ ] Handles API errors gracefully
- [ ] Loading state shows while fetching
- [ ] Component re-renders when data changes
- [ ] Works on mobile and desktop

## Implementation Steps

1. Install date-fns for date formatting
2. Create /api/rides/next endpoint
3. Create NextRide component
4. Add loading and error states
5. Format date in Dutch
6. Translate difficulty levels
7. Add styling with Tailwind
8. Integrate into landing page (story 010)
9. Test with different ride dates
10. Test error cases

## Date Formatting

Using date-fns with Dutch locale:
- `EEEE d MMMM yyyy` → "zondag 15 maart 2025"
- Capitalize first letter of day name
- Display start time in 24h format

## Notes

- **Public Data:** Only shows basic ride info, not full route details or GPX
- **Login Required:** Full details, map, and GPX download require authentication
- **Caching:** Consider caching next ride data (changes max once per day)
- **Time Zone:** Ensure dates are handled correctly for Belgian time zone
- **Inactive Rides:** Only show rides with status 'scheduled', not 'cancelled'
