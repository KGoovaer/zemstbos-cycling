import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 500 }
      )
    }

    // Create a season for 2025
    let season = await prisma.season.findUnique({
      where: { year: 2025 },
    })

    if (!season) {
      season = await prisma.season.create({
        data: {
          year: 2025,
          startDate: new Date('2025-03-01'),
          endDate: new Date('2025-10-31'),
          isActive: true,
        },
      })
    }

    // Create sample routes
    const route1 = await prisma.route.create({
      data: {
        name: 'Mechelen - Leuven Route',
        description: 'Een mooie rit door het Hageland',
        distanceKm: 65.5,
        elevationM: 320,
        difficulty: 'medium',
        startLocation: 'Mechelen',
        region: 'Hageland',
        gpxData: '<?xml version="1.0"?><gpx version="1.1"><trk><name>Sample</name></trk></gpx>',
      },
    })

    const route2 = await prisma.route.create({
      data: {
        name: 'Dijle Vallei Klassiek',
        description: 'Langs de Dijle door het platteland',
        distanceKm: 52.0,
        elevationM: 180,
        difficulty: 'easy',
        startLocation: 'Zemst',
        region: 'Dijlevallei',
        gpxData: '<?xml version="1.0"?><gpx version="1.1"><trk><name>Sample</name></trk></gpx>',
      },
    })

    const route3 = await prisma.route.create({
      data: {
        name: 'Vlaams-Brabant Hellingen',
        description: 'Een uitdagende rit met flinke klimmen',
        distanceKm: 78.5,
        elevationM: 650,
        difficulty: 'hard',
        startLocation: 'Leuven',
        region: 'Vlaams-Brabant',
        gpxData: '<?xml version="1.0"?><gpx version="1.1"><trk><name>Sample</name></trk></gpx>',
      },
    })

    // Calculate next three Sundays
    const today = new Date()
    const nextSunday = new Date(today)
    nextSunday.setDate(today.getDate() + ((7 - today.getDay()) % 7 || 7))

    const sunday2 = new Date(nextSunday)
    sunday2.setDate(nextSunday.getDate() + 7)

    const sunday3 = new Date(nextSunday)
    sunday3.setDate(nextSunday.getDate() + 14)

    // Create scheduled rides
    const ride1 = await prisma.scheduledRide.create({
      data: {
        seasonId: season.id,
        routeId: route1.id,
        rideDate: nextSunday,
        team: 'A',
        startTime: '09:00:00',
        status: 'scheduled',
        notes: 'Denk aan je bidon! We stoppen halverwege voor koffie.',
      },
    })

    const ride2 = await prisma.scheduledRide.create({
      data: {
        seasonId: season.id,
        routeId: route2.id,
        rideDate: sunday2,
        team: 'B',
        startTime: '09:30:00',
        status: 'scheduled',
      },
    })

    const ride3 = await prisma.scheduledRide.create({
      data: {
        seasonId: season.id,
        routeId: route3.id,
        rideDate: sunday3,
        team: 'A',
        startTime: '08:30:00',
        status: 'scheduled',
        notes: 'Zware rit! Zorg voor goede voeding en conditie.',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Successfully added 3 sample rides',
      rides: [
        { date: ride1.rideDate, route: route1.name },
        { date: ride2.rideDate, route: route2.name },
        { date: ride3.rideDate, route: route3.name },
      ],
    })
  } catch (error) {
    console.error('Error adding sample rides:', error)
    return NextResponse.json(
      { error: 'Failed to add sample rides', details: String(error) },
      { status: 500 }
    )
  }
}
