import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      )
    }

    const route = await prisma.route.findFirst({
      where: {
        name: {
          contains: 'Wintertoer'
        }
      },
      select: {
        id: true,
        name: true,
        distanceKm: true,
        elevationM: true,
        difficulty: true,
        startLocation: true,
        description: true,
      }
    })

    if (!route) {
      return NextResponse.json(
        { error: 'Wintertoer route not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ route })
  } catch (error) {
    console.error('Error fetching Wintertoer route:', error)
    return NextResponse.json(
      { error: 'Failed to fetch route' },
      { status: 500 }
    )
  }
}
