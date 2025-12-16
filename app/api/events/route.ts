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

    const eventsRaw = await prisma.event.findMany({
      where: {
        eventDate: {
          gte: today,
        },
      },
      orderBy: { eventDate: 'asc' },
      include: {
        attendees: {
          select: {
            status: true,
            userId: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    })

    // Calculate attendance breakdown for each event
    const events = eventsRaw.map(event => {
      const attendingList = event.attendees
        .filter(a => a.status === 'attending')
        .map(a => `${a.user.firstName} ${a.user.lastName}`);
      
      const maybeList = event.attendees
        .filter(a => a.status === 'maybe')
        .map(a => `${a.user.firstName} ${a.user.lastName}`);
      
      const declinedList = event.attendees
        .filter(a => a.status === 'declined')
        .map(a => `${a.user.firstName} ${a.user.lastName}`);
      
      return {
        ...event,
        _count: {
          attendees: event.attendees.length,
        },
        attendeeCounts: {
          attending: attendingList.length,
          maybe: maybeList.length,
          declined: declinedList.length,
        },
        attendeeNames: {
          attending: attendingList,
          maybe: maybeList,
          declined: declinedList,
        },
        attendees: event.attendees.filter(a => a.userId === session.user.id)
      };
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
