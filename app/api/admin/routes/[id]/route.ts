import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { deleteGPXFile, saveGPXFile } from '@/lib/gpx-storage'
import { parseGPX } from '@/lib/gpx-parser'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    const { name, description, difficulty, startLocation, region, gpxData } = body

    const updateData: {
      name: string
      description: string | null
      difficulty: string | null
      startLocation: string | null
      region: string | null
      distanceKm?: number
      elevationM?: number | null
      gpxData?: string
    } = {
      name,
      description,
      difficulty,
      startLocation,
      region,
    }

    // If new GPX data is provided, parse and recalculate distance/elevation
    if (gpxData) {
      const metadata = parseGPX(gpxData)
      updateData.distanceKm = metadata.distance
      updateData.elevationM = metadata.elevationGain
      
      // Save the new GPX file (will overwrite existing one)
      const gpxPath = await saveGPXFile(params.id, gpxData)
      updateData.gpxData = gpxPath
    }

    const route = await prisma.route.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json(route)
  } catch (error) {
    console.error('Error updating route:', error)
    return NextResponse.json(
      { error: 'Failed to update route' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
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

    const futureRides = await prisma.scheduledRide.count({
      where: {
        routeId: params.id,
        rideDate: { gte: new Date() },
      },
    })

    if (futureRides > 0) {
      return NextResponse.json(
        { error: `Deze route is gepland voor ${futureRides} toekomstige rit(ten). Verwijder eerst deze ritten.` },
        { status: 400 }
      )
    }

    await prisma.route.delete({
      where: { id: params.id },
    })

    await deleteGPXFile(params.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting route:', error)
    return NextResponse.json(
      { error: 'Failed to delete route' },
      { status: 500 }
    )
  }
}
