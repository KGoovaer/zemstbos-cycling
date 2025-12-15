#!/usr/bin/env ts-node

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface RideHistoryRow {
  nr: string;
  date: string;
  time: string;
  description: string;
  distanceKm: string;
  gpxLink: string;
}

function parseCSV(filePath: string): RideHistoryRow[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  
  // Skip header
  const dataLines = lines.slice(1);
  
  const rows: RideHistoryRow[] = [];
  
  for (const line of dataLines) {
    // Split by semicolon (CSV format used in the files)
    const columns = line.split(';').map(col => col.trim());
    
    if (columns.length >= 5 && columns[1] && columns[3]) {
      rows.push({
        nr: columns[0],
        date: columns[1],
        time: columns[2],
        description: columns[3],
        distanceKm: columns[4],
        gpxLink: columns[5] || ''
      });
    }
  }
  
  return rows;
}

function parseDate(dateStr: string): Date | null {
  // Handle formats like "02-03-2025" or "2-3-2025"
  const parts = dateStr.split('-');
  if (parts.length !== 3) return null;
  
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  
  return new Date(year, month - 1, day);
}

function getWeekNumber(date: Date, seasonYear: number): number {
  // Week number within the season (starting from March 1st)
  const seasonStart = new Date(seasonYear, 2, 1); // March 1st (month is 0-indexed)
  const diffTime = date.getTime() - seasonStart.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7) + 1;
}

async function findOrCreateRoute(description: string, distanceKm: string): Promise<string | null> {
  // Clean up the description to use as route name
  const routeName = description.trim();
  
  // Skip special entries
  if (routeName.toLowerCase().includes('rit naar keuze') ||
      routeName.toLowerCase().includes('sterrit') ||
      !distanceKm) {
    return null;
  }
  
  // Try to find existing route by name
  let route = await prisma.route.findFirst({
    where: {
      name: routeName
    }
  });
  
  // If not found, create a new route
  if (!route) {
    const distance = parseFloat(distanceKm.replace(',', '.'));
    if (isNaN(distance)) {
      console.log(`⚠️  Skipping route "${routeName}" - invalid distance: ${distanceKm}`);
      return null;
    }
    
    console.log(`📝 Creating new route: ${routeName} (${distance} km)`);
    route = await prisma.route.create({
      data: {
        name: routeName,
        description: `Imported from historical data`,
        distanceKm: distance,
        gpxData: '', // Empty GPX data - to be filled later
        startLocation: 'TBD',
        timesRidden: 0
      }
    });
  }
  
  return route.id;
}

async function importRideHistory(filePath: string, team: string, dryRun: boolean = false) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📥 Importing ride history for Team ${team}`);
  console.log(`📄 File: ${filePath}`);
  console.log(`🔧 Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log('='.repeat(80));
  
  const rows = parseCSV(filePath);
  console.log(`\n📊 Found ${rows.length} rides in CSV\n`);
  
  let imported = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const row of rows) {
    const date = parseDate(row.date);
    
    if (!date) {
      console.log(`⚠️  Row ${row.nr}: Invalid date format: ${row.date}`);
      skipped++;
      continue;
    }
    
    const seasonYear = date.getFullYear();
    const weekNumber = getWeekNumber(date, seasonYear);
    
    // Find or create the route
    const routeId = await findOrCreateRoute(row.description, row.distanceKm);
    
    if (!routeId) {
      console.log(`⏭️  Row ${row.nr}: Skipping "${row.description}" (${row.date})`);
      skipped++;
      continue;
    }
    
    if (dryRun) {
      console.log(`✓ Would import: ${row.description} on ${row.date} (Week ${weekNumber})`);
      imported++;
    } else {
      try {
        // Check if this ride already exists
        const existing = await prisma.rideHistory.findFirst({
          where: {
            routeId,
            rideDate: date
          }
        });
        
        if (existing) {
          console.log(`⚠️  Row ${row.nr}: Ride already exists for ${row.description} on ${row.date}`);
          skipped++;
          continue;
        }
        
        // Create ride history entry
        await prisma.rideHistory.create({
          data: {
            routeId,
            rideDate: date,
            seasonYear,
            weekNumber,
            notes: `Team ${team} - ${row.time}`
          }
        });
        
        // Update route's lastRidden and timesRidden
        await prisma.route.update({
          where: { id: routeId },
          data: {
            timesRidden: {
              increment: 1
            },
            lastRidden: date
          }
        });
        
        console.log(`✅ Row ${row.nr}: Imported ${row.description} on ${row.date} (Week ${weekNumber})`);
        imported++;
      } catch (error) {
        console.error(`❌ Row ${row.nr}: Error importing ${row.description}:`, error);
        errors++;
      }
    }
  }
  
  console.log(`\n${'='.repeat(80)}`);
  console.log('📊 Import Summary');
  console.log('='.repeat(80));
  console.log(`✅ Imported: ${imported}`);
  console.log(`⏭️  Skipped:  ${skipped}`);
  console.log(`❌ Errors:   ${errors}`);
  console.log('='.repeat(80));
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
Usage:
  ts-node scripts/import-ride-history.ts <file1.csv> [file2.csv ...] [--dry-run]

Options:
  --dry-run    Preview what would be imported without making changes

Examples:
  ts-node scripts/import-ride-history.ts ./A-ploeg.csv
  ts-node scripts/import-ride-history.ts ./A-ploeg.csv ./B-ploeg.csv
  ts-node scripts/import-ride-history.ts ./A-ploeg.csv --dry-run
    `);
    process.exit(1);
  }
  
  const dryRun = args.includes('--dry-run');
  const files = args.filter(arg => !arg.startsWith('--'));
  
  for (const file of files) {
    if (!fs.existsSync(file)) {
      console.error(`❌ File not found: ${file}`);
      continue;
    }
    
    // Determine team from filename
    const filename = path.basename(file);
    let team = 'A';
    if (filename.toLowerCase().includes('b-ploeg')) {
      team = 'B';
    }
    
    await importRideHistory(file, team, dryRun);
  }
  
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
