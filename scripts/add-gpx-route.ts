import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

interface RouteData {
  name: string
  description?: string
  distanceKm: number
  elevationM?: number
  difficulty?: 'easy' | 'medium' | 'hard'
  startLocation?: string
  region?: string
  gpxFilePath: string
}

async function addRoute(data: RouteData) {
  try {
    // Read GPX file
    const gpxPath = path.resolve(data.gpxFilePath)
    
    if (!fs.existsSync(gpxPath)) {
      throw new Error(`GPX file not found: ${gpxPath}`)
    }

    const gpxData = fs.readFileSync(gpxPath, 'utf-8')

    // Validate it's a GPX file
    if (!gpxData.includes('<gpx') && !gpxData.includes('<GPX')) {
      throw new Error('Invalid GPX file: missing <gpx> root element')
    }

    // Create route in database
    const route = await prisma.route.create({
      data: {
        name: data.name,
        description: data.description,
        distanceKm: data.distanceKm,
        elevationM: data.elevationM,
        difficulty: data.difficulty,
        startLocation: data.startLocation,
        region: data.region,
        gpxData: gpxData,
        timesRidden: 0,
      },
    })

    console.log('✅ Route successfully added!')
    console.log('ID:', route.id)
    console.log('Name:', route.name)
    console.log('Distance:', route.distanceKm, 'km')
    console.log('Elevation:', route.elevationM, 'm')
    
    return route
  } catch (error) {
    console.error('❌ Error adding route:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Example usage - modify this with your data
const routeData: RouteData = {
  name: 'Test Route Zemst-Mechelen',
  description: 'Een mooie rit door de Mechelse omgeving',
  distanceKm: 45.5,
  elevationM: 120,
  difficulty: 'medium',
  startLocation: 'Parking Gemeentehuis Zemst',
  region: 'Mechelen',
  gpxFilePath: process.argv[2] || './test-route.gpx', // Pass as command line argument
}

// Get route data from command line arguments if provided
if (process.argv.length >= 3) {
  addRoute(routeData)
} else {
  console.log('Usage: npx ts-node scripts/add-gpx-route.ts <path-to-gpx-file> [name] [distance] [elevation]')
  console.log('')
  console.log('Example:')
  console.log('  npx ts-node scripts/add-gpx-route.ts ./my-route.gpx "Zemst-Mechelen" 45.5 120')
  console.log('')
  console.log('Or edit the script directly to set route metadata.')
  process.exit(1)
}
