/**
 * Winter Rides Management
 * Handles off-season Sunday rides with Wintertoer route
 */

import { prisma } from './prisma'

/**
 * Get the Wintertoer route ID
 */
export async function getWintertoerRoute() {
  if (!prisma) return null
  
  const route = await prisma.route.findFirst({
    where: {
      name: {
        contains: 'Wintertoer'
      }
    }
  })
  
  return route
}

/**
 * Check if a date is in off-season (November through February)
 */
export function isOffSeason(date: Date): boolean {
  const month = date.getMonth() // 0-11
  return month >= 10 || month <= 1 // November (10) through February (1)
}

/**
 * Generate off-season Sunday rides for a date range
 * Returns virtual ride objects for Sundays at 9:00 with Wintertoer route
 */
export async function generateOffSeasonRides(startDate: Date, endDate: Date) {
  const winterRoute = await getWintertoerRoute()
  
  if (!winterRoute) {
    console.warn('Wintertoer route not found')
    return []
  }

  const rides = []
  const current = new Date(startDate)
  
  // Start from the first Sunday
  while (current.getDay() !== 0) {
    current.setDate(current.getDate() + 1)
  }
  
  // Generate rides for all Sundays in the date range
  while (current <= endDate) {
    if (isOffSeason(current)) {
      rides.push({
        id: `winter-${current.toISOString().split('T')[0]}`,
        rideDate: new Date(current),
        startTime: '09:00:00',
        status: 'scheduled',
        team: 'Winter',
        notes: 'Wintertoer - elke zondag om 9u',
        seasonId: null,
        routeId: winterRoute.id,
        route: {
          name: winterRoute.name,
          distanceKm: winterRoute.distanceKm,
          elevationM: winterRoute.elevationM,
          difficulty: winterRoute.difficulty,
        },
        attendees: [],
        _count: {
          attendees: 0
        },
        attendeeCounts: {
          attending: 0,
          maybe: 0,
          declined: 0
        },
        attendeeNames: {
          attending: [],
          maybe: [],
          declined: []
        },
        isWinterRide: true // Flag to identify virtual rides
      })
    }
    
    // Move to next Sunday
    current.setDate(current.getDate() + 7)
  }
  
  return rides
}

/**
 * Get all scheduled rides including off-season rides
 */
export async function getAllRidesWithWinter(seasonId?: string) {
  if (!prisma) return []
  
  // Get regular season rides
  const seasonRides = seasonId 
    ? await prisma.scheduledRide.findMany({
        where: { seasonId },
        include: {
          route: {
            select: {
              name: true,
              distanceKm: true,
              elevationM: true,
              difficulty: true,
            }
          },
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
        orderBy: { rideDate: 'asc' }
      })
    : []

  // Determine date range for off-season rides
  const now = new Date()
  const currentYear = now.getFullYear()
  
  // Show off-season rides from November of previous year to February of next year
  const startDate = new Date(currentYear - 1, 10, 1) // November 1st previous year
  const endDate = new Date(currentYear + 1, 2, 0) // Last day of February next year
  
  // Generate off-season rides
  const winterRides = await generateOffSeasonRides(startDate, endDate)
  
  // Filter out winter rides that overlap with scheduled season rides
  const seasonDates = new Set(
    seasonRides.map(r => r.rideDate.toISOString().split('T')[0])
  )
  
  const filteredWinterRides = winterRides.filter(wr => {
    const dateStr = wr.rideDate.toISOString().split('T')[0]
    return !seasonDates.has(dateStr)
  })
  
  // Combine and sort all rides
  const allRides = [...seasonRides, ...filteredWinterRides].sort(
    (a, b) => a.rideDate.getTime() - b.rideDate.getTime()
  )
  
  return allRides
}
