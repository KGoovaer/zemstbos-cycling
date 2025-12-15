import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { saveGPXFile } from '@/lib/gpx-storage'

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
    const {
      name,
      description,
      distanceKm,
      elevationM,
      difficulty,
      startLocation,
      region,
      gpxData,
    } = body

    if (!name || !distanceKm || !gpxData) {
      return NextResponse.json(
        { error: 'Name, distance, and GPX data are required' },
        { status: 400 }
      )
    }

    const id = crypto.randomUUID()
    
    const gpxPath = await saveGPXFile(id, gpxData)

    const route = await prisma.route.create({
      data: {
        id,
        name,
        description: description || null,
        distanceKm: parseFloat(distanceKm),
        elevationM: elevationM ? parseInt(elevationM) : null,
        difficulty: difficulty || null,
        startLocation: startLocation || null,
        region: region || null,
        gpxData: gpxPath,
        timesRidden: 0,
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
