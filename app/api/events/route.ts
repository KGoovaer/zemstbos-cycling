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

    // Determine if user is admin to show attendee names
    const isAdmin = session.user.role === 'admin'

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
            user: isAdmin ? {
              select: {
                firstName: true,
                lastName: true,
              },
            } : false,
          },
        },
      },
    })

    // Calculate attendance breakdown for each event
    const events = eventsRaw.map(event => {
      const attendingCount = event.attendees.filter(a => a.status === 'attending').length
      const maybeCount = event.attendees.filter(a => a.status === 'maybe').length
      const declinedCount = event.attendees.filter(a => a.status === 'declined').length

      // Only include names for admins
      const attendeeNames = isAdmin ? {
        attending: event.attendees
          .filter(a => a.status === 'attending')
          .map(a => `${a.user.firstName} ${a.user.lastName}`),
        maybe: event.attendees
          .filter(a => a.status === 'maybe')
          .map(a => `${a.user.firstName} ${a.user.lastName}`),
        declined: event.attendees
          .filter(a => a.status === 'declined')
          .map(a => `${a.user.firstName} ${a.user.lastName}`)
      } : undefined

      return {
        ...event,
        _count: {
          attendees: event.attendees.length,
        },
        attendeeCounts: {
          attending: attendingCount,
          maybe: maybeCount,
          declined: declinedCount,
        },
        attendeeNames,
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
