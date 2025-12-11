# 020 - Member Dashboard

**Epic:** Member Features
**Priority:** Must
**Estimated Effort:** 8 hours
**Phase:** 2

## User Story

As a **logged-in member**
I want **a dashboard that shows me the next ride and quick links**
So that **I can easily see what's coming up and navigate to what I need**

## Description

Create a member dashboard that serves as the landing page after login. The dashboard prominently displays the next upcoming ride with full details, upcoming rides, and quick links to important pages like calendar, profile, and events.

## Acceptance Criteria

- [ ] Dashboard accessible at /dashboard (requires authentication)
- [ ] Displays personalized welcome message with member's name
- [ ] Shows next upcoming ride with full details (date, route, map preview)
- [ ] Shows list of next 3-4 upcoming rides
- [ ] Payment status indicator visible
- [ ] Quick links to calendar, profile, events
- [ ] Responsive design for mobile and desktop
- [ ] Loading states while fetching data
- [ ] Redirects to login if not authenticated

## Technical Implementation

### Database Changes

None (reads from existing tables)

### API Endpoints

- `GET /api/dashboard/overview` - Fetch dashboard data (next rides, user info)

### Components/Pages

**Pages:**
- `/app/(member)/dashboard/page.tsx` - Member dashboard

**Components:**
- `/components/dashboard/WelcomeHeader.tsx` - Welcome message with user name
- `/components/dashboard/NextRideCard.tsx` - Next ride display
- `/components/dashboard/UpcomingRides.tsx` - List of upcoming rides
- `/components/dashboard/QuickLinks.tsx` - Navigation shortcuts
- `/components/dashboard/PaymentStatus.tsx` - Payment indicator

**Layout:**
- `/app/(member)/layout.tsx` - Member area layout with navigation

### Implementation

Create `/app/(member)/dashboard/page.tsx`:

```typescript
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { WelcomeHeader } from '@/components/dashboard/WelcomeHeader'
import { NextRideCard } from '@/components/dashboard/NextRideCard'
import { UpcomingRides } from '@/components/dashboard/UpcomingRides'
import { QuickLinks } from '@/components/dashboard/QuickLinks'
import { PaymentStatus } from '@/components/dashboard/PaymentStatus'

export const metadata = {
  title: 'Dashboard - Wielrijvereniging',
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <WelcomeHeader name={session.user.name} />

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <NextRideCard />
            <UpcomingRides />
          </div>

          <div className="space-y-6">
            <PaymentStatus userId={session.user.id} />
            <QuickLinks />
          </div>
        </div>
      </div>
    </div>
  )
}
```

Create `/components/dashboard/NextRideCard.tsx`:

```typescript
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import Link from 'next/link'

export async function NextRideCard() {
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const nextRide = await prisma.scheduledRide.findFirst({
    where: {
      rideDate: { gte: now },
      status: 'scheduled'
    },
    include: {
      route: true
    },
    orderBy: {
      rideDate: 'asc'
    }
  })

  if (!nextRide) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <p className="text-xl text-gray-600">
          Geen ritten gepland op dit moment
        </p>
      </div>
    )
  }

  const formattedDate = format(new Date(nextRide.rideDate), 'EEEE d MMMM yyyy', { locale: nl })

  return (
    <div className="bg-blue-50 rounded-lg shadow-lg p-8 border-2 border-blue-300">
      <h2 className="text-3xl font-bold mb-4">Volgende Zondag</h2>

      <div className="bg-white rounded-lg p-6 mb-4">
        <p className="text-2xl font-semibold text-blue-900 capitalize mb-2">
          {formattedDate}
        </p>
        <p className="text-xl text-gray-700">Start: {nextRide.startTime}</p>
      </div>

      <h3 className="text-4xl font-bold mb-6 text-gray-900">
        {nextRide.route.name}
      </h3>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-blue-600">
            {nextRide.route.distanceKm} km
          </div>
          <div className="text-lg text-gray-600">Afstand</div>
        </div>
        <div className="bg-white rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-blue-600">
            {nextRide.route.elevationM}m
          </div>
          <div className="text-lg text-gray-600">Hoogte</div>
        </div>
        <div className="bg-white rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-blue-600 capitalize">
            {nextRide.route.difficulty === 'easy' && 'Makkelijk'}
            {nextRide.route.difficulty === 'medium' && 'Gemiddeld'}
            {nextRide.route.difficulty === 'hard' && 'Zwaar'}
          </div>
          <div className="text-lg text-gray-600">Niveau</div>
        </div>
      </div>

      {nextRide.notes && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <p className="text-lg">{nextRide.notes}</p>
        </div>
      )}

      <Link
        href={`/ride/${nextRide.id}`}
        className="block w-full bg-blue-600 text-white text-center px-6 py-4 text-xl font-semibold rounded-lg hover:bg-blue-700 min-h-touch"
      >
        Bekijk route details
      </Link>
    </div>
  )
}
```

### Libraries/Dependencies

No additional dependencies (uses date-fns from story 011)

## Dependencies

- **Depends on:** 003 - Authentication, 004 - Role-Based Access
- **Related:** 021 - Season Calendar, 022 - Route Detail Page

## UI/UX Notes

**Design Principles:**
- Large, prominent display of next ride
- Clear visual hierarchy
- Easy-to-read date and time
- Quick access to common actions
- Welcoming, personalized experience

**Accessibility:**
- High contrast colors
- Large touch targets
- Clear section headings
- Logical reading order

## Testing Considerations

- [ ] Dashboard requires authentication
- [ ] Shows correct user name
- [ ] Displays next upcoming ride
- [ ] Shows payment status correctly
- [ ] Quick links work
- [ ] Responsive on mobile
- [ ] Handles no upcoming rides gracefully

## Implementation Steps

1. Create (member) route group for authenticated pages
2. Create dashboard page with authentication check
3. Create WelcomeHeader component
4. Create NextRideCard component
5. Create UpcomingRides component
6. Create QuickLinks component
7. Create PaymentStatus component
8. Add member layout with navigation
9. Test authentication redirect
10. Test on multiple devices

## Notes

- **First Impression:** Dashboard is the first page members see after login
- **Performance:** Pre-render next ride data for fast load
- **Updates:** Consider adding "refresh" button or auto-refresh
- **Personalization:** Can add more personalized content in future (ride history, stats)
