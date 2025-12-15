import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { readGPXFile } from '@/lib/gpx-storage'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  if (!prisma) {
    return NextResponse.json(
      { error: 'Database connection not available' },
      { status: 500 }
    )
  }

  try {
    const route = await prisma.route.findUnique({
      where: { id: params.id },
      select: { gpxData: true }
    })

    if (!route) {
      return NextResponse.json(
        { error: 'Route not found' },
        { status: 404 }
      )
    }

    let gpxData: string
    
    if (route.gpxData.startsWith('/gpx-files/')) {
      gpxData = await readGPXFile(params.id)
    } else {
      gpxData = route.gpxData
    }

    return NextResponse.json({ gpxData })
  } catch (error) {
    console.error('Error fetching GPX data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch GPX data' },
      { status: 500 }
    )
  }
}
