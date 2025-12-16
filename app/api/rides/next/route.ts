import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getWintertoerRoute, isOffSeason } from '@/lib/winter-rides'

export async function GET() {
  if (!process.env.DATABASE_URL || !prisma) {
    return NextResponse.json(
      { message: 'Database niet geconfigureerd' },
      { status: 503 }
    )
  }

  try {
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
          rideDate: {
            gte: now,
          },
          status: 'scheduled',
        },
        include: {
          route: {
            select: {
              id: true,
              name: true,
              description: true,
              distanceKm: true,
              elevationM: true,
              difficulty: true,
            },
          },
        },
        orderBy: {
          rideDate: 'asc',
        },
      })

      // If no scheduled ride OR next Sunday comes before the scheduled ride, return winter ride
      if (!nextScheduledRide || nextSunday < new Date(nextScheduledRide.rideDate)) {
        const winterRoute = await getWintertoerRoute()
        
        if (winterRoute) {
          // Return a winter ride object that matches the expected structure
          return NextResponse.json({
            id: `winter-${nextSunday.toISOString().split('T')[0]}`,
            rideDate: nextSunday,
            startTime: '09:00:00',
            status: 'scheduled',
            team: 'Winter',
            notes: 'Vaste winterrit - Elke zondag om 9u tijdens het winterseizoen',
            seasonId: null,
            route: {
              id: winterRoute.id,
              name: winterRoute.name,
              description: winterRoute.description || 'Onze vaste winterroute',
              distanceKm: winterRoute.distanceKm,
              elevationM: winterRoute.elevationM,
              difficulty: winterRoute.difficulty,
            },
            isWinterRide: true,
          })
        }
      }

      // If we have a scheduled ride that comes before or on next Sunday, return it
      if (nextScheduledRide) {
        return NextResponse.json(nextScheduledRide)
      }
    }

    // Normal flow: get next scheduled ride
    const nextRide = await prisma.scheduledRide.findFirst({
      where: {
        rideDate: {
          gte: now,
        },
        status: 'scheduled',
      },
      include: {
        route: {
          select: {
            id: true,
            name: true,
            description: true,
            distanceKm: true,
            elevationM: true,
            difficulty: true,
          },
        },
      },
      orderBy: {
        rideDate: 'asc',
      },
    })

    if (!nextRide) {
      return NextResponse.json(
        { message: 'Geen ritten gepland op dit moment' },
        { status: 404 }
      )
    }

    return NextResponse.json(nextRide)
  } catch (error) {
    console.error('Error fetching next ride:', error)
    return NextResponse.json(
      { error: 'Fout bij ophalen van rit' },
      { status: 500 }
    )
  }
}

// Cache for 5 minutes since ride data doesn't change frequently
export const revalidate = 300
export const dynamic = 'force-dynamic'
