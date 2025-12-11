# 027 - Events List

**Epic:** Member Features
**Priority:** Should
**Estimated Effort:** 4 hours
**Phase:** 2

## User Story

As a **logged-in member**
I want **to see upcoming club events**
So that **I know about social activities, meetings, and non-ride events**

## Description

Display a list of upcoming club events such as season kickoff, social gatherings, closing event, and meetings. Events complement the regular Sunday rides.

## Acceptance Criteria

- [ ] Events page shows upcoming events
- [ ] Each event shows title, date, time, location, description
- [ ] Events sorted chronologically
- [ ] Past events not shown (or shown separately)
- [ ] Event type icons/badges visible
- [ ] Mobile responsive list
- [ ] Empty state when no events

## Technical Implementation

### Database Changes

None (uses events table)

### API Endpoints

None (server-side rendering)

### Components/Pages

Create `/app/(member)/events/page.tsx`:

```typescript
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { EventCard } from '@/components/events/EventCard'

export const metadata = {
  title: 'Evenementen - Wielrijvereniging',
}

export default async function EventsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const events = await prisma.event.findMany({
    where: {
      eventDate: { gte: now }
    },
    orderBy: {
      eventDate: 'asc'
    }
  })

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-5xl font-bold mb-8">Evenementen</h1>

        {events.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-xl text-gray-600">
              Geen aankomende evenementen op dit moment
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

Create `/components/events/EventCard.tsx`:

```typescript
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'

const eventTypeLabels = {
  kickoff: { label: 'Seizoensopening', icon: '🚴', color: 'bg-green-100 text-green-700' },
  social: { label: 'Sociaal', icon: '🎉', color: 'bg-purple-100 text-purple-700' },
  meeting: { label: 'Vergadering', icon: '📋', color: 'bg-blue-100 text-blue-700' },
  closing: { label: 'Seizoensafsluiting', icon: '🏁', color: 'bg-orange-100 text-orange-700' },
}

export function EventCard({ event }: { event: any }) {
  const formattedDate = format(new Date(event.eventDate), 'EEEE d MMMM yyyy', { locale: nl })
  const eventType = eventTypeLabels[event.eventType as keyof typeof eventTypeLabels] || eventTypeLabels.social

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <span className={`px-3 py-1 rounded-full text-base font-semibold ${eventType.color}`}>
              {eventType.icon} {eventType.label}
            </span>
          </div>

          <h2 className="text-3xl font-bold mb-2">{event.title}</h2>

          <div className="text-xl text-gray-700 mb-3">
            <p className="capitalize">{formattedDate}</p>
            {event.eventTime && (
              <p>Tijd: {event.eventTime}</p>
            )}
          </div>

          {event.location && (
            <p className="text-lg text-gray-600 mb-3">
              📍 {event.location}
            </p>
          )}

          {event.description && (
            <p className="text-lg text-gray-700 mt-4">
              {event.description}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
```

## Dependencies

- **Depends on:** 002 - Database Schema, 003 - Authentication
- **Related:** 037 - Event Management (admin creates events)

## UI/UX Notes

- Clear event type badges with icons
- Large, readable event titles
- Date and location prominently displayed
- Color-coded by event type

## Testing Considerations

- [ ] Shows upcoming events only
- [ ] Events sorted by date
- [ ] Event types display correctly
- [ ] Empty state works
- [ ] Mobile responsive

## Notes

- **Event Types:** kickoff, social, meeting, closing
- **Simple View:** Members just view, admins manage (story 037)
