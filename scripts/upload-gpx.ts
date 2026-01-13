#!/usr/bin/env ts-node
import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import * as readline from 'readline'

let prisma: PrismaClient

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function question(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve))
}

async function parseGPXBasicInfo(gpxData: string): Promise<{ distance: number; elevation: number }> {
  // Basic GPX parsing - extract distance and elevation
  const trackPointsMatch = gpxData.match(/<trkpt[^>]*>/g)
  
  if (!trackPointsMatch || trackPointsMatch.length < 2) {
    console.log('⚠️  Could not auto-calculate from GPX')
    return { distance: 0, elevation: 0 }
  }

  console.log(`📍 Found ${trackPointsMatch.length} track points`)
  
  // For now, return 0 - user will input manually
  // Full parsing with Haversine formula can be added later
  return { distance: 0, elevation: 0 }
}

async function main() {
  // Initialize Prisma client
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

  console.log('🚴 GPX Route Uploader\n')

  // Get GPX file path
  const gpxFilePath = await question('GPX bestand pad: ')
  const gpxPath = path.resolve(gpxFilePath.trim())

  if (!fs.existsSync(gpxPath)) {
    console.error('❌ Bestand niet gevonden:', gpxPath)
    process.exit(1)
  }

  const gpxData = fs.readFileSync(gpxPath, 'utf-8')

  if (!gpxData.includes('<gpx') && !gpxData.includes('<GPX')) {
    console.error('❌ Geen geldig GPX bestand')
    process.exit(1)
  }

  console.log('✅ GPX bestand ingelezen\n')

  // Try to parse basic info
  await parseGPXBasicInfo(gpxData)

  // Get route metadata
  const name = await question('Route naam: ')
  const description = await question('Beschrijving (optioneel): ')
  const distanceStr = await question('Afstand in km: ')
  const elevationStr = await question('Hoogtemeters (optioneel): ')
  const difficultyStr = await question('Moeilijkheidsgraad (easy/medium/hard, optioneel): ')
  const startLocation = await question('Startlocatie (optioneel): ')
  const region = await question('Regio (optioneel): ')

  // Parse and validate
  const distance = parseFloat(distanceStr)
  if (isNaN(distance) || distance <= 0) {
    console.error('❌ Ongeldige afstand')
    process.exit(1)
  }

  const elevation = elevationStr ? parseInt(elevationStr) : undefined
  const difficulty = difficultyStr ? difficultyStr.toLowerCase() as 'easy' | 'medium' | 'hard' : undefined

  if (difficulty && !['easy', 'medium', 'hard'].includes(difficulty)) {
    console.error('❌ Ongeldige moeilijkheidsgraad (gebruik: easy, medium, of hard)')
    process.exit(1)
  }

  console.log('\n📋 Route informatie:')
  console.log('  Naam:', name)
  console.log('  Beschrijving:', description || '-')
  console.log('  Afstand:', distance, 'km')
  console.log('  Hoogtemeters:', elevation || '-')
  console.log('  Moeilijkheid:', difficulty || '-')
  console.log('  Startlocatie:', startLocation || '-')
  console.log('  Regio:', region || '-')

  const confirm = await question('\n✅ Opslaan in database? (ja/nee): ')

  if (confirm.toLowerCase() !== 'ja' && confirm.toLowerCase() !== 'j') {
    console.log('❌ Geannuleerd')
    process.exit(0)
  }

  try {
    const route = await prisma.route.create({
      data: {
        name: name.trim(),
        description: description.trim() || null,
        distanceKm: distance,
        elevationM: elevation,
        difficulty: difficulty,
        startLocation: startLocation.trim() || null,
        region: region.trim() || null,
        gpxData: gpxData,
      },
    })

    console.log('\n✅ Route succesvol toegevoegd!')
    console.log('ID:', route.id)
    console.log('\n🗺️  Je kunt de route nu bekijken door een ride toe te voegen in de kalender.')
  } catch (error) {
    console.error('\n❌ Fout bij opslaan:', error)
    process.exit(1)
  } finally {
    rl.close()
    await prisma.$disconnect()
  }
}

main()
