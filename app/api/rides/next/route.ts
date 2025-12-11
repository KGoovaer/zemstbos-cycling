import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
