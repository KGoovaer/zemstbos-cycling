import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!prisma) {
    return NextResponse.json(
      { error: 'Database not available' },
      { status: 503 }
    )
  }

  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const events = await prisma.event.findMany({
      where: {
        eventDate: {
          gte: today,
        },
      },
      orderBy: { eventDate: 'asc' },
      include: {
        _count: {
          select: { attendees: true },
        },
        attendees: {
          where: {
            userId: session.user.id,
          },
          select: {
            status: true,
          },
        },
      },
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}
