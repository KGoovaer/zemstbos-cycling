import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Adding sample data...')

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
    console.log('✓ Created season:', season.year)
  } else {
    console.log('✓ Found existing season:', season.year)
  }

  // Create sample routes with minimal GPX data
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
  console.log('✓ Created route:', route1.name)

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
  console.log('✓ Created route:', route2.name)

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
  console.log('✓ Created route:', route3.name)

  // Create scheduled rides for upcoming Sundays
  const today = new Date()
  const nextSunday = new Date(today)
  nextSunday.setDate(today.getDate() + ((7 - today.getDay()) % 7 || 7))

  const sunday2 = new Date(nextSunday)
  sunday2.setDate(nextSunday.getDate() + 7)

  const sunday3 = new Date(nextSunday)
  sunday3.setDate(nextSunday.getDate() + 14)

  const ride1 = await prisma.scheduledRide.create({
    data: {
      seasonId: season.id,
      routeId: route1.id,
      rideDate: nextSunday,
      startTime: new Date('1970-01-01T09:00:00'),
      status: 'scheduled',
      notes: 'Denk aan je bidon! We stoppen halverwege voor koffie.',
    },
  })
  console.log('✓ Created ride for:', ride1.rideDate.toISOString().split('T')[0])

  const ride2 = await prisma.scheduledRide.create({
    data: {
      seasonId: season.id,
      routeId: route2.id,
      rideDate: sunday2,
      startTime: new Date('1970-01-01T09:30:00'),
      status: 'scheduled',
      notes: null,
    },
  })
  console.log('✓ Created ride for:', ride2.rideDate.toISOString().split('T')[0])

  const ride3 = await prisma.scheduledRide.create({
    data: {
      seasonId: season.id,
      routeId: route3.id,
      rideDate: sunday3,
      startTime: new Date('1970-01-01T08:30:00'),
      status: 'scheduled',
      notes: 'Zware rit! Zorg voor goede voeding en conditie.',
    },
  })
  console.log('✓ Created ride for:', ride3.rideDate.toISOString().split('T')[0])

  console.log('\n✅ Successfully added 3 sample rides!')
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
