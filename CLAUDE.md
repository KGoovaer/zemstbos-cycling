# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A self-hosted web application for managing a cycling club with seasonal rides (March-October). The application is designed with accessibility in mind for older, less tech-savvy members.

**Current Status:** Planning phase. No implementation code exists yet. All architecture and design decisions are documented in `cycling-club-plan.md`.

**License:** Apache 2.0

## Technology Stack

The planned technology stack (not yet implemented):

- **Frontend:** Next.js 14 (App Router)
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth.js with Credentials provider
- **Styling:** Tailwind CSS
- **Map Visualization:** Leaflet.js with CyclOSM tiles
- **GPX Processing:** Custom GPX parsing + leaflet-gpx library
- **Deployment:** Kubernetes

## Development Commands

Once the project is initialized, the following commands will be used:

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Database operations
npx prisma migrate dev          # Create and apply migrations
npx prisma generate             # Generate Prisma Client
npx prisma studio              # Open Prisma Studio (DB GUI)
npx prisma db push             # Push schema changes without migrations
npx prisma db seed             # Seed the database

# Linting and formatting
npm run lint                    # Run ESLint
npm run format                  # Format with Prettier (if configured)

# Testing
npm test                        # Run Jest tests (if configured)
npm run test:watch             # Run tests in watch mode
npm run test:e2e               # Run E2E tests (Playwright/Cypress)
```

## Architecture

### User Roles and Access Control

Three distinct access levels:

1. **Public (No Authentication)**
   - Landing page with club info
   - Next upcoming ride teaser
   - Contact information

2. **Member (Authenticated Cyclists)**
   - Full season calendar access
   - Detailed route information (maps, elevation, GPX downloads)
   - Personal profile and payment status

3. **Admin**
   - All member capabilities
   - Season schedule management (CRUD)
   - Member management and payment tracking
   - GPX file uploads and route management
   - Access to route suggestion algorithm

### Database Schema

Seven core entities (see `cycling-club-plan.md` for full SQL schema):

- **users** - Member accounts with roles (member/admin) and payment status
- **routes** - GPX library with distance, elevation, difficulty ratings
- **seasons** - Yearly cycling seasons (March-October timeframe)
- **scheduled_rides** - Calendar of rides with assigned routes
- **events** - Non-ride activities (kickoff, social events, closing)
- **ride_history** - Historical data for the route suggestion algorithm
- **Indexes** - Optimized for common queries (date-based lookups, active users)

### Application Structure

Expected directory structure once implemented:

```
/app                    # Next.js 14 App Router pages
  /(auth)              # Authentication routes (login)
  /(public)            # Public pages (home, contact)
  /(member)            # Member-only pages (dashboard, calendar, routes)
  /(admin)             # Admin-only pages (schedule, member management)
  /api                 # API routes
    /auth              # NextAuth.js configuration
    /routes            # Route management endpoints
    /schedule          # Schedule management endpoints
    /members           # Member management endpoints
/components            # React components
  /ui                  # Reusable UI components
  /maps                # Map and GPX visualization components
  /admin               # Admin-specific components
/lib                   # Utility functions and configurations
  /prisma.ts           # Prisma client instance
  /auth.ts             # Authentication utilities
  /gpx-parser.ts       # GPX parsing logic
/prisma                # Database schema and migrations
  /schema.prisma       # Prisma schema definition
  /migrations          # Database migration files
  /seed.ts             # Database seeding script
/public                # Static assets
  /icons               # Map markers and UI icons
/scripts               # Utility scripts
  /import-gpx.js       # Bulk GPX import tool
  /import-history.js   # Historical data import
```

### Key Features and Algorithms

**Route Suggestion Algorithm:**

The system suggests routes for upcoming rides based on historical patterns:

1. Calculate the "week number" within the season (1 = first week of March)
2. Query routes ridden in that specific week in previous years
3. Exclude routes already scheduled for the current season
4. Rank by:
   - **Tradition factor:** How often the route was ridden in that week historically
   - **Variety factor:** How long since the route was last ridden
   - **Distance consistency:** Similarity to historical distance patterns for that week
5. Present top 3 suggestions to admin

See `cycling-club-plan.md` (lines 206-267) for pseudocode implementation.

**GPX Processing:**

When admins upload GPX files:
- Parse XML to extract track points (latitude, longitude, elevation)
- Calculate total distance using Haversine formula
- Calculate elevation gain (sum of positive elevation changes)
- Store both the raw GPX data and computed metadata
- Extract coordinates for map bounds calculation

### UI/UX Design Principles

The application is designed for older users with limited technical experience:

- **Large typography:** Minimum 18px base font size, high contrast
- **Big touch targets:** Minimum 48x48px buttons with clear labels
- **Simple navigation:** Maximum 4-5 menu items, always visible "Home" link
- **Minimal cognitive load:** One primary action per page, progressive disclosure
- **Forgiving interactions:** Confirmation dialogs for destructive actions, clear error messages

See `cycling-club-plan.md` (lines 271-299) for complete design guidelines.

## Development Workflow

### Initial Setup (Not Yet Done)

When implementing the project:

1. Initialize Next.js project: `npx create-next-app@latest .`
2. Install dependencies: Prisma, NextAuth.js, Tailwind CSS, Leaflet
3. Configure Prisma with PostgreSQL connection
4. Set up environment variables in `.env.local`:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
5. Create and apply initial database migration
6. Seed database with initial admin user

### Development Phases

The project is planned in 5 phases (~140 hours total):

1. **Phase 1 (2-3 weeks):** Foundation - setup, authentication, RBAC
2. **Phase 2 (2-3 weeks):** Member features - dashboard, routes, calendar
3. **Phase 3 (3-4 weeks):** Admin features - management, uploads, suggestions
4. **Phase 4 (1-2 weeks):** Polish - events, responsive design, accessibility
5. **Phase 5 (ongoing):** Enhancements - notifications, attendance, weather, PWA

See `cycling-club-plan.md` (lines 621-658) for detailed phase breakdowns.

## Deployment

### Kubernetes Configuration

The application will be deployed to Kubernetes with:

- **Resources:** 256Mi-512Mi memory, 100m-500m CPU
- **Replicas:** 2 for high availability
- **TLS:** Managed by cert-manager with Let's Encrypt
- **Secrets:** Database URL and NextAuth secret stored in K8s Secrets

See `cycling-club-plan.md` (lines 662-740) for complete K8s manifests.

### Environment Variables

Required environment variables:

```bash
DATABASE_URL="postgresql://user:password@host:5432/dbname"
NEXTAUTH_SECRET="generated-secret-key"
NEXTAUTH_URL="https://club.yourdomain.be"
```

## Data Import

### Bulk GPX Import

Use the planned import script to bulk load existing GPX files:

```bash
node scripts/import-gpx.js ./path/to/gpx-files/
```

The script:
- Reads all `.gpx` files from the specified directory
- Parses each file to extract metadata (distance, elevation)
- Creates route records in the database
- Sets default values (start location, difficulty can be edited later)

### Historical Schedule Import

Import past ride schedules from CSV/Excel:

```bash
node scripts/import-history.js ./path/to/schedule.csv
```

Expected CSV columns: `date`, `route_name`, `participants`

This populates the `ride_history` table for the route suggestion algorithm.

## Important Context

### Primary Documentation

All detailed architecture, wireframes, and implementation details are in:
- `cycling-club-plan.md` - Comprehensive 873-line project plan

When making architectural decisions, always reference this plan first.

### Code Style and Patterns

When implementing:

- Use TypeScript for type safety
- Follow Next.js 14 App Router conventions
- Use Prisma for all database operations (no raw SQL except in migrations)
- Implement proper error handling with user-friendly messages
- Ensure all admin actions require authentication and role checks
- Test accessibility with keyboard navigation and screen readers

### Security Considerations

- Passwords hashed with bcrypt
- Session-based authentication via NextAuth.js
- Role-based access control on all API routes
- Input validation on all user-submitted data (GPX uploads, form inputs)
- SQL injection protection via Prisma's parameterized queries
- CSRF protection built into Next.js forms

### Privacy Requirements

**Attendee Visibility:**
- **Members** can only see participant **counts** (e.g., "12 attending") - NOT individual names
- **Admins** can see full attendee lists with names via dedicated admin endpoints
- This protects member privacy and reduces social pressure around participation

Implementation:
- API endpoints conditionally fetch user details based on role (`isAdmin`)
- UI components conditionally display names only when `attendeeNames` is present
- Admin-only endpoints: `/api/admin/rides/[id]/attendees` and `/api/admin/events/[id]/attendees`

### Accessibility Requirements

Critical for the target user base:

- All interactive elements must be keyboard accessible
- Form inputs need clear labels and error messages
- Use semantic HTML for screen reader compatibility
- Ensure color contrast meets WCAG AA standards
- Provide text alternatives for all map visualizations
- Test with actual older users before launch
