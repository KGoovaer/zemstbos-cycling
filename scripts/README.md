# Import Scripts Documentation

This directory contains bulk import tools for populating the database with historical data and member information.

## Available Scripts

### 1. Import Ride History (`import-ride-history.ts`)

Imports historical ride schedules from CSV files to populate the `ride_history` table. This data is used by the route suggestion algorithm to recommend routes based on past riding patterns.

#### Usage

```bash
# Import single file
npm run import:history -- "./A-ploeg.csv"

# Import multiple files
npm run import:history -- "./A-ploeg.csv" "./B-ploeg.csv"

# Dry run (preview without importing)
npm run import:history -- "./A-ploeg.csv" --dry-run
```

#### CSV Format

Expected columns (semicolon-separated):
- `Nr` - Row number
- `Datum` - Date in DD-MM-YYYY format (e.g., "02-03-2025")
- `Uur` - Start time (e.g., "09.00")
- `Omschrijving` - Route description/name
- `Aantal KM` - Distance in kilometers (e.g., "87,3" or "87.3")
- `GPX` - GPX file link (optional)

Example:
```csv
Nr;Datum;Uur;Omschrijving;Aantal KM;GPX
1;02-03-2025;09.00;Zennedijk – Temse – Weert ( Leest);87,3;https://...
2;09-03-2025;09.00;Berlaar – Wiekevorst (Hombeek);81,7;https://...
```

#### What It Does

1. **Parses CSV**: Reads the CSV file and extracts ride data
2. **Date Parsing**: Converts DD-MM-YYYY format to proper dates
3. **Route Matching**:
   - Searches for existing routes by name
   - Creates new routes if not found (with placeholder GPX data)
4. **Week Calculation**: Calculates week number within the season (starting from March 1st)
5. **Ride History**: Creates entries in the `ride_history` table

#### Special Handling

- **Skips**: Entries like "Rit naar keuze", "Sterrit", or entries without distance
- **Duplicates**: Won't re-import rides that already exist for the same route and date
- **Team Detection**: Automatically detects team (A or B) from filename

#### Output

Progress is displayed with colored emojis:
- ✅ Successfully imported
- 📝 Creating new route
- ⏭️ Skipped (special ride or no distance)
- ⚠️ Warning (duplicate or invalid data)
- ❌ Error

### 2. Import Members (`import-members.ts`)

Imports member information from CSV to create user accounts.

#### Usage

```bash
# Import members
npm run import:members -- "./Ledenlijst ZemstBos.csv"

# Dry run (preview without importing)
npm run import:members -- "./Ledenlijst ZemstBos.csv" --dry-run
```

#### CSV Format

Expected columns (semicolon-separated):
- `Nr` - Member number
- `Naam` - Last name
- `Voornaam` - First name
- `Adres` - Address (stored but not used in user record)
- `Telefoon` - Phone number
- `E-mailadres` - Email address (or "/" for none)
- `Geboortedatum` - Birth date (stored but not used in user record)

Example:
```csv
Nr;Naam;Voornaam;Adres;Telefoon;E-mailadres;Geboortedatum
1;Alaert;Lieven;Spiltstraat 186, 1980 Zemst;015/610543;lieven.alaert@aon.com;21/01/1966
```

#### What It Does

1. **Parses CSV**: Reads member data from CSV
2. **Email Handling**:
   - Uses provided email if available
   - Generates placeholder email (firstname.lastname@zemstbos.local) if missing or "/"
   - Ensures uniqueness by adding numbers if needed
3. **Phone Formatting**: Cleans and formats phone numbers (removes spaces, converts to +32)
4. **Birth Date Parsing**: Handles both DD/MM/YYYY format and Excel serial dates
5. **Address Storage**: Saves complete address information
6. **Creates Users**:
   - Sets default password: `ChangeMe123!`
   - Role: `member`
   - Payment status: `unpaid`
   - Links to current active season if available
7. **Updates Existing**: If a member with the same name exists, updates their information

#### Security Note

⚠️ **Default Password**: All imported members get the password `ChangeMe123!`  
Members should be instructed to change their password on first login.

#### Output

- ✅ Created new member
- 🔄 Updated existing member
- ⏭️ Skipped (missing data)
- ❌ Error (duplicate email or other issue)

## Step-by-Step Import Guide

### Initial Setup

1. **Prepare CSV files** in the repository root:
   - `A-ploeg.csv` - A-team ride schedule
   - `B-ploeg.csv` - B-team ride schedule
   - `Ledenlijst ZemstBos.csv` - Member list

2. **Verify database** is initialized:
   ```bash
   npx prisma migrate dev
   ```

3. **Create a season** (if not exists):
   ```bash
   # Via the admin UI or directly in database
   # The season should cover March-October of the relevant year
   ```

### Import Process

#### Step 1: Dry Run (Recommended)

Always test with `--dry-run` first to verify data:

```bash
# Test member import
npm run import:members -- "./Ledenlijst ZemstBos.csv" --dry-run

# Test A-team history
npm run import:history -- "./A-ploeg.csv" --dry-run

# Test B-team history
npm run import:history -- "./B-ploeg.csv" --dry-run
```

Review the output for any warnings or errors.

#### Step 2: Import Members

```bash
npm run import:members -- "./Ledenlijst ZemstBos.csv"
```

This creates user accounts for all members.

#### Step 3: Import Ride History

```bash
# Import A-team rides
npm run import:history -- "./A-ploeg.csv"

# Import B-team rides
npm run import:history -- "./B-ploeg.csv"

# Or import both at once
npm run import:history -- "./A-ploeg.csv" "./B-ploeg.csv"
```

This populates routes and ride history.

### Post-Import Tasks

1. **Verify Routes**: Check that all routes were created correctly
   ```bash
   # Via Prisma Studio
   npx prisma studio
   ```

2. **Add GPX Data**: For routes without GPX:
   - Use the admin UI to upload GPX files
   - Or use the `upload-gpx.ts` script

3. **Update Route Details**:
   - Set proper start locations
   - Set difficulty ratings
   - Add descriptions

4. **Member Communication**:
   - Send welcome emails with login instructions
   - Include default password: `ChangeMe123!`
   - Remind them to change password on first login

## Troubleshooting

### Common Issues

**Issue**: "File not found" error  
**Solution**: Ensure file path is correct, use quotes for paths with spaces

**Issue**: "Invalid date format"  
**Solution**: Dates must be in DD-MM-YYYY format (e.g., "02-03-2025")

**Issue**: TypeScript compilation errors  
**Solution**: Ensure all dependencies are installed: `npm install`

**Issue**: Duplicate email errors  
**Solution**: The script handles this automatically by adding numbers. If persistent, check for actual duplicates in CSV.

**Issue**: "Route already exists for this date"  
**Solution**: This is expected for duplicate entries. The script skips them automatically.

### Data Validation

Before importing, verify your CSV files:

1. **Encoding**: Should be UTF-8 with BOM (for proper special character handling)
2. **Delimiter**: Semicolon (`;`) separated
3. **No empty lines** between data rows (empty lines at end are OK)
4. **Consistent columns**: All rows should have the same number of columns

### Viewing Import Results

Use Prisma Studio to inspect imported data:

```bash
npx prisma studio
```

Navigate to:
- `users` table - See imported members
- `routes` table - See created routes
- `ride_history` table - See historical rides

## CSV File Locations

The import scripts expect CSV files in the repository root by default:

- `/Users/koen.goovaerts/source/repo/zemstbos-cycling/A-ploeg.csv`
- `/Users/koen.goovaerts/source/repo/zemstbos-cycling/B-ploeg.csv`
- `/Users/koen.goovaerts/source/repo/zemstbos-cycling/Ledenlijst ZemstBos.csv`

You can specify different paths when running the scripts.

## Re-running Imports

The scripts are designed to be **idempotent** where possible:

- **Members**: Updates existing members instead of creating duplicates
- **Ride History**: Skips rides that already exist for the same date/route
- **Routes**: Reuses existing routes with matching names

This means you can safely re-run imports to update data or add new entries.

## Development

To modify the import scripts:

1. Edit the TypeScript files in `/scripts/`
2. Test with `--dry-run` flag
3. The scripts use Prisma Client for database operations
4. Error handling is included for common issues

### Adding New Import Scripts

Follow the existing pattern:
1. Create TypeScript file in `/scripts/`
2. Import Prisma Client
3. Add CSV parsing logic
4. Implement dry-run mode
5. Add progress logging with emojis
6. Add npm script to `package.json`
7. Document in this README
