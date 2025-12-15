import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!prisma) {
    return NextResponse.json({ error: 'Database connection not available' }, { status: 503 })
  }

  try {
    const ride = await prisma.scheduledRide.findUnique({
      where: { id: params.id },
      include: {
        route: true,
        season: true,
      },
    })

    if (!ride) {
      return NextResponse.json({ error: 'Ride not found' }, { status: 404 })
    }

    return NextResponse.json({
      ride: {
        id: ride.id,
        rideDate: ride.rideDate,
        startTime: ride.startTime,
        status: ride.status,
        notes: ride.notes,
        route: {
          id: ride.route.id,
          name: ride.route.name,
          description: ride.route.description,
          distanceKm: ride.route.distanceKm.toString(),
          elevationM: ride.route.elevationM,
          difficulty: ride.route.difficulty,
          startLocation: ride.route.startLocation,
          gpxData: ride.route.gpxData,
        },
        season: {
          id: ride.season.id,
          year: ride.season.year,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching ride:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ride details' },
      { status: 500 }
    )
  }
}
