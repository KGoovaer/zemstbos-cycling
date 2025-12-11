import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  if (!process.env.DATABASE_URL || !prisma) {
    return NextResponse.json(
      { message: 'Database not configured' },
      { status: 503 }
    )
  }

  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const nextRide = await prisma.scheduledRide.findFirst({
      where: {
        rideDate: {
          gte: today,
        },
        status: 'scheduled',
      },
      include: {
        route: true,
      },
      orderBy: {
        rideDate: 'asc',
      },
    })

    if (!nextRide) {
      return NextResponse.json(
        { message: 'No upcoming rides found' },
        { status: 404 }
      )
    }

    return NextResponse.json(nextRide)
  } catch (error) {
    console.error('Error fetching next ride:', error)
    return NextResponse.json(
      { error: 'Failed to fetch next ride' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
export const revalidate = 0
