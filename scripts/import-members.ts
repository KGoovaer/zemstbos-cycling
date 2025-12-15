#!/usr/bin/env ts-node

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

interface MemberRow {
  nr: string;
  lastName: string;
  firstName: string;
  address: string;
  phone: string;
  email: string;
  birthDate: string;
}

function parseCSV(filePath: string): MemberRow[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  
  // Skip header
  const dataLines = lines.slice(1);
  
  const rows: MemberRow[] = [];
  
  for (const line of dataLines) {
    // Split by semicolon
    const columns = line.split(';').map(col => col.trim());
    
    // Must have at least 7 columns and non-empty lastName
    if (columns.length >= 7 && columns[1]) {
      rows.push({
        nr: columns[0],
        lastName: columns[1],
        firstName: columns[2],
        address: columns[3],
        phone: columns[4],
        email: columns[5],
        birthDate: columns[6]
      });
    }
  }
  
  return rows;
}

function parseBirthDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  
  // Handle Excel serial dates (like 24021, 28678, etc.)
  if (/^\d{5}$/.test(dateStr)) {
    const excelEpoch = new Date(1899, 11, 30);
    const days = parseInt(dateStr, 10);
    const date = new Date(excelEpoch.getTime() + days * 24 * 60 * 60 * 1000);
    return date;
  }
  
  // Handle DD/MM/YYYY format
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      return new Date(year, month - 1, day);
    }
  }
  
  return null;
}

function generateEmail(firstName: string, lastName: string): string {
  // Generate a placeholder email if none provided
  const cleanFirst = firstName.toLowerCase().replace(/\s+/g, '');
  const cleanLast = lastName.toLowerCase().replace(/\s+/g, '');
  return `${cleanFirst}.${cleanLast}@zemstbos.local`;
}

function cleanPhone(phone: string): string {
  // Remove spaces and format phone number
  return phone.replace(/\s+/g, '').replace(/^0/, '+32');
}

async function generateUniqueEmail(baseEmail: string): Promise<string> {
  let email = baseEmail;
  let counter = 1;
  
  while (await prisma.user.findUnique({ where: { email } })) {
    email = baseEmail.replace('@', `${counter}@`);
    counter++;
  }
  
  return email;
}

async function importMembers(filePath: string, dryRun: boolean = false) {
  console.log(`\n${'='.repeat(80)}`);
  console.log('👥 Importing Member List');
  console.log(`📄 File: ${filePath}`);
  console.log(`🔧 Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log('='.repeat(80));
  
  const rows = parseCSV(filePath);
  console.log(`\n📊 Found ${rows.length} members in CSV\n`);
  
  let imported = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;
  
  // Get the current active season if it exists
  const currentSeason = await prisma.season.findFirst({
    where: { isActive: true },
    orderBy: { year: 'desc' }
  });
  
  for (const row of rows) {
    if (!row.firstName || !row.lastName) {
      console.log(`⚠️  Row ${row.nr}: Missing name data`);
      skipped++;
      continue;
    }
    
    // Clean and validate email
    let email = row.email && row.email !== '/' ? row.email : generateEmail(row.firstName, row.lastName);
    email = await generateUniqueEmail(email);
    
    // Clean phone
    const phone = row.phone ? cleanPhone(row.phone) : null;
    
    // Parse address
    const address = row.address ? row.address : null;
    
    // Parse birth date
    const birthDate = parseBirthDate(row.birthDate);
    
    if (dryRun) {
      console.log(`✓ Would import: ${row.firstName} ${row.lastName} <${email}>`);
      imported++;
    } else {
      try {
        // Check if user already exists by name
        const existing = await prisma.user.findFirst({
          where: {
            firstName: row.firstName,
            lastName: row.lastName
          }
        });
        
        if (existing) {
          // Update existing user
          await prisma.user.update({
            where: { id: existing.id },
            data: {
              email,
              phone,
              address,
              birthDate,
              isActive: true
            }
          });
          console.log(`🔄 Row ${row.nr}: Updated ${row.firstName} ${row.lastName}`);
          updated++;
        } else {
          // Create default password (member should change it)
          const defaultPassword = 'ChangeMe123!';
          const passwordHash = await bcrypt.hash(defaultPassword, 10);
          
          // Create new user
          const newUser = await prisma.user.create({
            data: {
              email,
              passwordHash,
              firstName: row.firstName,
              lastName: row.lastName,
              phone,
              address,
              birthDate,
              role: 'member',
              paymentStatus: 'unpaid',
              isActive: true
            }
          });
          
          console.log(`✅ Row ${row.nr}: Created ${row.firstName} ${row.lastName} <${email}>`);
          imported++;
          
          // If there's a current season, add them as unpaid for this season
          if (currentSeason) {
            await prisma.user.update({
              where: { id: newUser.id },
              data: {
                paidSeasonId: currentSeason.id,
                paymentStatus: 'unpaid',
                paymentYear: currentSeason.year
              }
            });
          }
        }
      } catch (error: any) {
        if (error.code === 'P2002') {
          console.error(`❌ Row ${row.nr}: Email ${email} already exists`);
        } else {
          console.error(`❌ Row ${row.nr}: Error importing ${row.firstName} ${row.lastName}:`, error.message);
        }
        errors++;
      }
    }
  }
  
  console.log(`\n${'='.repeat(80)}`);
  console.log('📊 Import Summary');
  console.log('='.repeat(80));
  console.log(`✅ Created:  ${imported}`);
  console.log(`🔄 Updated:  ${updated}`);
  console.log(`⏭️  Skipped:  ${skipped}`);
  console.log(`❌ Errors:   ${errors}`);
  console.log('='.repeat(80));
  
  if (!dryRun && imported > 0) {
    console.log(`\n⚠️  NOTE: New members have default password: "ChangeMe123!"`);
    console.log(`   They should change it on first login.\n`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
Usage:
  ts-node scripts/import-members.ts <members.csv> [--dry-run]

Options:
  --dry-run    Preview what would be imported without making changes

Example:
  ts-node scripts/import-members.ts "./Ledenlijst ZemstBos.csv"
  ts-node scripts/import-members.ts "./Ledenlijst ZemstBos.csv" --dry-run
    `);
    process.exit(1);
  }
  
  const dryRun = args.includes('--dry-run');
  const file = args.find(arg => !arg.startsWith('--'));
  
  if (!file) {
    console.error('❌ No file specified');
    process.exit(1);
  }
  
  if (!fs.existsSync(file)) {
    console.error(`❌ File not found: ${file}`);
    process.exit(1);
  }
  
  await importMembers(file, dryRun);
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
