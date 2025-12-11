# 039 - Bulk Import Tools

**Epic:** Admin Features
**Priority:** Should
**Estimated Effort:** 8 hours
**Phase:** 3

## User Story

As an **admin**
I want **scripts to bulk import historical data**
So that **route suggestions and historical records are populated**

## Description

Command-line scripts to import GPX files in bulk and import historical ride schedules from CSV for the route suggestion algorithm.

## Acceptance Criteria

- [ ] Script to import multiple GPX files from directory
- [ ] Script to import ride history from CSV
- [ ] Validation and error reporting
- [ ] Dry-run mode to preview imports
- [ ] Progress indicator for bulk operations
- [ ] Documentation for running scripts

## Technical Implementation

### Database Changes
None

### Scripts

Create `/scripts/import-gpx-bulk.ts`:
```typescript
// Imports all GPX files from a directory
// Parses each file and creates route records
// See cycling-club-plan.md lines 750-788
```

Create `/scripts/import-ride-history.ts`:
```typescript
// Imports historical schedule from CSV
// Populates ride_history table
// See cycling-club-plan.md lines 793-829
```

## Dependencies

- **Depends on:** 002 - Database Schema
- **Enables:** 036 - Route Suggestions

## UI/UX Notes

Not applicable (command-line tools)

## Testing Considerations

- [ ] GPX bulk import works
- [ ] History CSV import works
- [ ] Error handling for invalid data
- [ ] Dry-run shows what would be imported
- [ ] Progress displays correctly

## Implementation Steps

1. Create scripts/import-gpx-bulk.ts
2. Create scripts/import-ride-history.ts
3. Add npm scripts to package.json
4. Document in README
5. Test with sample data
6. Handle errors gracefully

## Usage

```bash
# Import GPX files
npm run import:gpx ./gpx-files/

# Import ride history
npm run import:history ./historical-schedule.csv

# Dry run
npm run import:gpx ./gpx-files/ --dry-run
```

## CSV Format

Expected columns for ride history:
- date (YYYY-MM-DD)
- route_name
- participants (optional)
- notes (optional)

## Notes

- **One-time Import:** Typically run once during initial setup
- **Route Matching:** Match CSV route names to database routes
