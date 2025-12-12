# 002 - Database Schema - Done

**Epic:** Foundation
**Priority:** Must
**Estimated Effort:** 6 hours
**Phase:** 1

## User Story

As a **developer**
I want **a well-designed PostgreSQL database schema with Prisma ORM**
So that **the application can store and manage cycling club data efficiently and safely**

## Description

Implement the complete database schema for the cycling club application using Prisma ORM. The schema includes 7 core tables: users, routes, seasons, scheduled_rides, events, ride_history, and appropriate indexes for performance.

The database design supports the three user roles (public, member, admin), route management, season scheduling, and the route suggestion algorithm.

## Acceptance Criteria

- [ ] Prisma installed and configured
- [ ] Database connection established to PostgreSQL
- [ ] All 7 tables defined in Prisma schema
- [ ] Relationships between tables properly configured
- [ ] Indexes created for performance optimization
- [ ] Initial migration created and applied
- [ ] Seed script created for initial admin user
- [ ] Prisma Client generated successfully
- [ ] Database can be reset and re-seeded for development

## Technical Implementation

### Database Changes

**Full Prisma Schema** (`prisma/schema.prisma`):

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            String   @id @default(uuid()) @db.Uuid
  email         String   @unique @db.VarChar(255)
  passwordHash  String?  @map("password_hash") @db.VarChar(255)
  firstName     String   @map("first_name") @db.VarChar(100)
  lastName      String   @map("last_name") @db.VarChar(100)
  phone         String?  @db.VarChar(20)
  role          String   @default("member") @db.VarChar(20)
  paymentStatus String   @default("unpaid") @map("payment_status") @db.VarChar(20)
  paymentYear   Int?     @map("payment_year")
  isActive      Boolean  @default(true) @map("is_active")
  googleId      String?  @unique @map("google_id") @db.VarChar(255)
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  @@index([isActive], name: "idx_users_active")
  @@map("users")
}

model Route {
  id             String   @id @default(uuid()) @db.Uuid
  name           String   @db.VarChar(255)
  description    String?  @db.Text
  distanceKm     Decimal  @map("distance_km") @db.Decimal(5, 1)
  elevationM     Int?     @map("elevation_m")
  difficulty     String?  @db.VarChar(20)
  gpxData        String   @map("gpx_data") @db.Text
  startLocation  String?  @map("start_location") @db.VarChar(255)
  region         String?  @db.VarChar(100)
  timesRidden    Int      @default(0) @map("times_ridden")
  lastRidden     DateTime? @map("last_ridden") @db.Date
  createdAt      DateTime @default(now()) @map("created_at")

  scheduledRides       ScheduledRide[] @relation("ScheduledRideRoute")
  weatherBackupRides   ScheduledRide[] @relation("WeatherBackupRoute")
  rideHistory          RideHistory[]

  @@map("routes")
}

model Season {
  id          String   @id @default(uuid()) @db.Uuid
  year        Int      @unique
  startDate   DateTime @map("start_date") @db.Date
  endDate     DateTime @map("end_date") @db.Date
  isActive    Boolean  @default(false) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")

  scheduledRides ScheduledRide[]

  @@map("seasons")
}

model ScheduledRide {
  id             String   @id @default(uuid()) @db.Uuid
  seasonId       String   @map("season_id") @db.Uuid
  routeId        String   @map("route_id") @db.Uuid
  rideDate       DateTime @map("ride_date") @db.Date
  startTime      DateTime @default(dbgenerated("'09:00:00'::time")) @map("start_time") @db.Time
  status         String   @default("scheduled") @db.VarChar(20)
  notes          String?  @db.Text
  weatherBackup  String?  @map("weather_backup") @db.Uuid
  createdAt      DateTime @default(now()) @map("created_at")

  season         Season   @relation(fields: [seasonId], references: [id])
  route          Route    @relation("ScheduledRideRoute", fields: [routeId], references: [id])
  backupRoute    Route?   @relation("WeatherBackupRoute", fields: [weatherBackup], references: [id])

  @@unique([rideDate])
  @@index([rideDate], name: "idx_scheduled_rides_date")
  @@map("scheduled_rides")
}

model Event {
  id          String   @id @default(uuid()) @db.Uuid
  title       String   @db.VarChar(255)
  description String?  @db.Text
  eventDate   DateTime @map("event_date") @db.Date
  eventTime   DateTime? @map("event_time") @db.Time
  location    String?  @db.VarChar(255)
  eventType   String?  @map("event_type") @db.VarChar(50)
  createdAt   DateTime @default(now()) @map("created_at")

  @@map("events")
}

model RideHistory {
  id               String   @id @default(uuid()) @db.Uuid
  routeId          String   @map("route_id") @db.Uuid
  rideDate         DateTime @map("ride_date") @db.Date
  seasonYear       Int      @map("season_year")
  weekNumber       Int      @map("week_number")
  participantCount Int?     @map("participant_count")
  notes            String?  @db.Text

  route Route @relation(fields: [routeId], references: [id])

  @@index([weekNumber, seasonYear], name: "idx_ride_history_week")
  @@map("ride_history")
}
```

### API Endpoints
None directly (database is accessed via Prisma Client in API routes)

### Components/Pages
None directly (database accessed from backend)

### Libraries/Dependencies

```json
{
  "prisma": "^5.0.0",
  "@prisma/client": "^5.0.0"
}
```

**Dev Dependencies:**
```json
{
  "prisma": "^5.0.0"
}
```

### Prisma Client Setup

Create `/lib/prisma.ts`:
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### Seed Script

Create `/prisma/seed.ts`:
```typescript
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create initial admin user
  const adminPassword = await bcrypt.hash('admin123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@cyclingclub.be' },
    update: {},
    create: {
      email: 'admin@cyclingclub.be',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      paymentStatus: 'exempt',
      isActive: true,
    },
  })

  // Create current season (2025)
  const season2025 = await prisma.season.upsert({
    where: { year: 2025 },
    update: {},
    create: {
      year: 2025,
      startDate: new Date('2025-03-02'), // First Sunday of March
      endDate: new Date('2025-10-26'),   // Last Sunday of October
      isActive: true,
    },
  })

  console.log({ admin, season2025 })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

Update `package.json`:
```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

## Dependencies

- **Depends on:** 001 - Project Setup
- **Blocks:** 003 - Authentication, and all feature stories

## UI/UX Notes

Not applicable (backend only)

## Testing Considerations

- [ ] Can connect to PostgreSQL database successfully
- [ ] All migrations apply without errors
- [ ] Seed script creates admin user and season
- [ ] Prisma Client generates without errors
- [ ] All relationships work correctly (foreign keys)
- [ ] Indexes exist on queried fields
- [ ] Can query all tables via Prisma Client
- [ ] Can reset database with `npx prisma migrate reset`
- [ ] Prisma Studio works: `npx prisma studio`

## Implementation Steps

1. Install Prisma: `npm install @prisma/client && npm install -D prisma`
2. Initialize Prisma: `npx prisma init`
3. Update `.env` with PostgreSQL connection string
4. Create complete Prisma schema in `prisma/schema.prisma`
5. Create initial migration: `npx prisma migrate dev --name init`
6. Install bcryptjs for password hashing: `npm install bcryptjs @types/bcryptjs`
7. Create seed script in `prisma/seed.ts`
8. Add seed command to `package.json`
9. Create Prisma client singleton in `lib/prisma.ts`
10. Run seed: `npx prisma db seed`
11. Verify with Prisma Studio: `npx prisma studio`

## Environment Variables

Add to `.env.example`:
```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/cycling_club?schema=public"
```

## Notes

- **PostgreSQL Required:** Development requires PostgreSQL 13+ installed locally or accessible
- **Password Hash:** Admin default password is 'admin123' (must be changed in production)
- **Google ID Field:** Added `googleId` to users table for Google OAuth (story 003)
- **Data Types:** Using UUID for IDs, DECIMAL for distances, appropriate VARCHAR sizes
- **Cascade Deletes:** Configure with caution - may want to prevent route deletion if scheduled
- **Migration Strategy:** Use `prisma migrate dev` for development, `prisma migrate deploy` for production
