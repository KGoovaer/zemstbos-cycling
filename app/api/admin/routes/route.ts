import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const minDistance = searchParams.get('minDistance')
    const maxDistance = searchParams.get('maxDistance')
    const difficulty = searchParams.get('difficulty')
    const sortBy = searchParams.get('sortBy') || 'name'
    const sortOrder = searchParams.get('sortOrder') || 'asc'

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { region: { contains: search, mode: 'insensitive' } },
        { startLocation: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (minDistance || maxDistance) {
      where.distanceKm = {}
      if (minDistance) where.distanceKm.gte = parseFloat(minDistance)
      if (maxDistance) where.distanceKm.lte = parseFloat(maxDistance)
    }

    if (difficulty) {
      where.difficulty = difficulty
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orderBy: any = {}
    if (sortBy === 'name') {
      orderBy.name = sortOrder
    } else if (sortBy === 'distance') {
      orderBy.distanceKm = sortOrder
    }

    const routes = await prisma.route.findMany({
      where,
      orderBy,
      select: {
        id: true,
        name: true,
        description: true,
        distanceKm: true,
        elevationM: true,
        difficulty: true,
        startLocation: true,
        region: true,
        createdAt: true,
        _count: {
          select: {
            scheduledRides: {
              where: {
                rideDate: { gte: new Date() },
              },
            },
          },
        },
      },
    })

    return NextResponse.json(routes)
  } catch (error) {
    console.error('Error fetching routes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch routes' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()

    const { name, description, distanceKm, elevationM, difficulty, startLocation, region, gpxData } = body

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Route naam is verplicht' },
        { status: 400 }
      )
    }

    if (!distanceKm || distanceKm <= 0) {
      return NextResponse.json(
        { error: 'Afstand moet groter zijn dan 0 km' },
        { status: 400 }
      )
    }

    const route = await prisma.route.create({
      data: {
        name: name.trim(),
        description: description || null,
        distanceKm: parseFloat(distanceKm),
        elevationM: elevationM ? parseInt(elevationM) : null,
        difficulty: difficulty || null,
        startLocation: startLocation || null,
        region: region || null,
        gpxData: gpxData || null,
      },
    })

    return NextResponse.json(route, { status: 201 })
  } catch (error) {
    console.error('Error creating route:', error)
    return NextResponse.json(
      { error: 'Failed to create route' },
      { status: 500 }
    )
  }
}
