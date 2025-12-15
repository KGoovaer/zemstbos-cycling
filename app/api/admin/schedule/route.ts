import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const session = await auth()

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!prisma) {
    return NextResponse.json(
      { error: 'Database not available' },
      { status: 503 }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const seasonId = searchParams.get('seasonId')
    const team = searchParams.get('team')

    const where: { seasonId?: string; team?: string } = {}
    if (seasonId) where.seasonId = seasonId
    if (team) where.team = team

    const scheduledRides = await prisma.scheduledRide.findMany({
      where,
      include: {
        route: {
          select: {
            id: true,
            name: true,
            distanceKm: true,
            elevationM: true,
            difficulty: true,
          },
        },
        backupRoute: {
          select: {
            id: true,
            name: true,
            distanceKm: true,
          },
        },
        season: {
          select: {
            year: true,
          },
        },
      },
      orderBy: { rideDate: 'asc' },
    })

    return NextResponse.json(scheduledRides)
  } catch (error) {
    console.error('Error fetching schedule:', error)
    return NextResponse.json(
      { error: 'Failed to fetch schedule' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const session = await auth()

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!prisma) {
    return NextResponse.json(
      { error: 'Database not available' },
      { status: 503 }
    )
  }

  try {
    const body = await request.json()
    const {
      seasonId,
      routeId,
      rideDate,
      team,
      startTime,
      notes,
      weatherBackup,
    } = body

    if (!seasonId || !routeId || !rideDate || !team) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if ride already exists for this date and team
    const existingRide = await prisma.scheduledRide.findUnique({
      where: {
        rideDate_team: {
          rideDate: new Date(rideDate),
          team,
        },
      },
    })

    if (existingRide) {
      return NextResponse.json(
        { error: 'A ride is already scheduled for this date and team' },
        { status: 409 }
      )
    }

    const scheduledRide = await prisma.scheduledRide.create({
      data: {
        seasonId,
        routeId,
        rideDate: new Date(rideDate),
        team,
        startTime: startTime || '09:00:00',
        notes,
        weatherBackup,
      },
      include: {
        route: true,
        backupRoute: true,
      },
    })

    return NextResponse.json(scheduledRide, { status: 201 })
  } catch (error) {
    console.error('Error creating scheduled ride:', error)
    return NextResponse.json(
      { error: 'Failed to create scheduled ride' },
      { status: 500 }
    )
  }
}
