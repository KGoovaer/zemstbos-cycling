# Cycling Club Management Website - Project Plan

## Project Overview

A self-hosted web application for managing a cycling club with seasonal rides (March-October), focusing on simplicity for older, less tech-savvy members.

---

## Core Requirements Summary

| Requirement | Priority | Complexity |
|-------------|----------|------------|
| Public landing page | Must | Low |
| Member login (simple!) | Must | Medium |
| Admin login & dashboard | Must | Medium |
| View upcoming Sunday ride | Must | Low |
| Season calendar management | Must | Medium |
| Route visualization (km, elevation) | Must | Medium |
| GPX download | Must | Low |
| Route suggestions from history | Should | Medium |
| Member management | Must | Low |
| Payment status tracking | Must | Low |
| Event management | Should | Low |

---

## User Roles & Permissions

### 1. Public (No Login)
- View landing page with club info
- See next upcoming ride (teaser only)
- Contact form / club location

### 2. Member (Cyclist)
- Everything public, plus:
- View full season calendar
- See detailed route info (map, km, elevation)
- Download GPX files
- View their own profile & payment status
- RSVP to rides and events
- **Privacy**: Can only see participant **counts** (e.g., "12 attending"), not individual names

### 3. Admin
- Everything member can do, plus:
- Manage season schedule (CRUD)
- Assign routes to dates
- Manage members (add/edit/deactivate)
- Update payment status
- Create/manage events
- Upload new GPX files
- View route suggestions based on history
- **Privacy**: Can view full list of ride/event attendees with names

---

## Technical Architecture

### Recommended Stack

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│                                                              │
│   Next.js 14 (App Router)                                   │
│   - Server-side rendering (fast initial load)               │
│   - Simple, accessible UI with Tailwind CSS                 │
│   - Large buttons, clear typography for older users         │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                        BACKEND                               │
│                                                              │
│   Next.js API Routes + Prisma ORM                           │
│   - Single deployment (simplifies K8s setup)                │
│   - Type-safe database access                               │
│   - Built-in authentication with NextAuth.js                │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                       DATABASE                               │
│                                                              │
│   PostgreSQL                                                 │
│   - Stores users, routes, schedules, events                 │
│   - GPX files stored as text (they're just XML)             │
│   - Or: file storage for GPX + metadata in DB               │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                    EXTERNAL SERVICES                         │
│                                                              │
│   BRouter API (free, self-hostable)                         │
│   - Route visualization                                      │
│   - Elevation profiles                                       │
│                                                              │
│   Leaflet + CyclOSM tiles (free)                            │
│   - Map display                                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Why This Stack?

1. **Next.js**: Single codebase for frontend + backend, excellent for small teams
2. **PostgreSQL**: You likely already run this on K8s, battle-tested
3. **Prisma**: Makes database work simple and type-safe
4. **NextAuth.js**: Dead-simple authentication, supports email/password
5. **Tailwind CSS**: Rapid UI development, easy to make accessible
6. **Leaflet + CyclOSM**: Free, no API keys needed, cycling-focused maps

### Alternative: Simpler Stack (if Next.js feels heavy)

```
Frontend: Plain HTML/CSS/JS with Alpine.js (very lightweight)
Backend:  Go or Python FastAPI
Database: SQLite (if < 100 members) or PostgreSQL
```

---

## Database Schema

```sql
-- Users table
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    phone           VARCHAR(20),
    role            VARCHAR(20) DEFAULT 'member', -- 'member' | 'admin'
    payment_status  VARCHAR(20) DEFAULT 'unpaid', -- 'paid' | 'unpaid' | 'exempt'
    payment_year    INTEGER, -- e.g., 2025
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- Routes table (your GPX library)
CREATE TABLE routes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    distance_km     DECIMAL(5,1) NOT NULL,
    elevation_m     INTEGER, -- total elevation gain
    difficulty      VARCHAR(20), -- 'easy' | 'medium' | 'hard'
    gpx_data        TEXT NOT NULL, -- the actual GPX XML
    start_location  VARCHAR(255), -- e.g., "Clubhouse parking"
    region          VARCHAR(100), -- for grouping/filtering
    created_at      TIMESTAMP DEFAULT NOW()
);

-- Seasons table
CREATE TABLE seasons (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year            INTEGER NOT NULL UNIQUE,
    start_date      DATE NOT NULL, -- e.g., first Sunday of March
    end_date        DATE NOT NULL, -- e.g., last Sunday of October
    is_active       BOOLEAN DEFAULT false,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- Scheduled rides (the calendar)
CREATE TABLE scheduled_rides (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    season_id       UUID REFERENCES seasons(id),
    route_id        UUID REFERENCES routes(id),
    ride_date       DATE NOT NULL,
    start_time      TIME DEFAULT '09:00',
    status          VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled' | 'cancelled' | 'completed'
    notes           TEXT, -- e.g., "Café stop at km 45"
    weather_backup  UUID REFERENCES routes(id), -- shorter alternative route
    created_at      TIMESTAMP DEFAULT NOW(),
    UNIQUE(ride_date) -- one ride per date
);

-- Events (non-ride activities)
CREATE TABLE events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    event_date      DATE NOT NULL,
    event_time      TIME,
    location        VARCHAR(255),
    event_type      VARCHAR(50), -- 'kickoff' | 'social' | 'meeting' | 'closing'
    created_at      TIMESTAMP DEFAULT NOW()
);

-- Route history (for suggestions algorithm)
CREATE TABLE ride_history (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id        UUID REFERENCES routes(id),
    ride_date       DATE NOT NULL,
    season_year     INTEGER NOT NULL,
    week_number     INTEGER NOT NULL, -- 1-35 (March week 1 to October week ~35)
    participant_count INTEGER,
    notes           TEXT
);

-- Indexes for performance
CREATE INDEX idx_scheduled_rides_date ON scheduled_rides(ride_date);
CREATE INDEX idx_ride_history_week ON ride_history(week_number, season_year);
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = true;
```

---

## Privacy & Access Control

### Attendee Visibility Rules

To protect member privacy, the system implements role-based visibility for ride and event attendees:

**For Members (Regular Cyclists):**
- Can see the **total count** of participants for each status (e.g., "12 attending", "3 maybe", "2 declined")
- **Cannot** see individual names or identities of other participants
- This encourages participation without social pressure or privacy concerns

**For Admins:**
- Can see **full attendee lists** with names and contact information
- Access via dedicated admin endpoints: `/api/admin/rides/[id]/attendees` and `/api/admin/events/[id]/attendees`
- Necessary for logistics planning (e.g., arranging café stops, managing group sizes)

### Implementation Details

The calendar page conditionally fetches attendee details based on user role:

```javascript
// Only fetch user details if admin
const isAdmin = session.user.role === 'admin'

const ridesRaw = await prisma.scheduledRide.findMany({
  include: {
    attendees: {
      select: {
        status: true,
        userId: true,
        user: isAdmin ? {
          select: { firstName: true, lastName: true }
        } : false
      }
    }
  }
})
```

The UI (RideCard component) conditionally displays:
- **Members**: Count badges only (e.g., "✓ 12")
- **Admins**: Count badges with hover tooltips showing names

This approach balances transparency (members can see participation levels) with privacy (members' identities remain private to peers).

---

## Route Suggestion Algorithm

Based on your requirement to suggest routes from previous years:

```
For each Sunday in the new season:
1. Calculate the "week number" within the season (1 = first week of March)
2. Look up what routes were ridden in that week in previous years
3. Exclude routes already scheduled this season
4. Rank by:
   - How often ridden in that specific week (tradition factor)
   - How long since last ridden (variety factor)
   - Similar distance to what was ridden that week before
5. Present top 3 suggestions to admin
```

### Example Logic (Pseudocode)

```javascript
function suggestRoutes(targetDate, seasonId) {
  const weekNumber = calculateSeasonWeek(targetDate); // 1-35
  
  // Get historical data for this week
  const history = await db.rideHistory.findMany({
    where: { week_number: weekNumber },
    include: { route: true }
  });
  
  // Get already scheduled routes this season
  const alreadyScheduled = await db.scheduledRides.findMany({
    where: { season_id: seasonId },
    select: { route_id: true }
  });
  const scheduledIds = alreadyScheduled.map(r => r.route_id);
  
  // Score each route
  const routeScores = {};
  for (const record of history) {
    if (scheduledIds.includes(record.route_id)) continue;

    if (!routeScores[record.route_id]) {
      routeScores[record.route_id] = {
        route: record.route,
        weekFrequency: 0,
        lastRidden: null,
        totalRides: 0
      };
    }
    routeScores[record.route_id].weekFrequency++;

    // Track most recent ride date and total ride count
    if (!routeScores[record.route_id].lastRidden ||
        record.ride_date > routeScores[record.route_id].lastRidden) {
      routeScores[record.route_id].lastRidden = record.ride_date;
    }
    routeScores[record.route_id].totalRides++;
  }
  
  // Sort by frequency (tradition), then by staleness (variety)
  return Object.values(routeScores)
    .sort((a, b) => {
      if (b.weekFrequency !== a.weekFrequency) {
        return b.weekFrequency - a.weekFrequency;
      }
      // If same frequency, prefer routes not ridden recently
      return new Date(a.lastRidden) - new Date(b.lastRidden);
    })
    .slice(0, 3);
}
```

---

## UI/UX Design Principles (for older users)

### Must-Haves

1. **Large, clear typography**
   - Minimum 18px base font size
   - High contrast (dark text on light background)
   - Sans-serif fonts (e.g., Inter, Open Sans)

2. **Big, obvious buttons**
   - Minimum 48x48px touch targets
   - Clear labels ("Download Route" not just an icon)
   - Distinct colors for primary actions

3. **Simple navigation**
   - Maximum 4-5 menu items
   - Always visible "Home" link
   - Breadcrumbs on deeper pages

4. **Minimal cognitive load**
   - One primary action per page
   - Progressive disclosure (show more only when needed)
   - Consistent layout across pages

5. **Forgiving interactions**
   - Confirmation for destructive actions
   - Clear error messages with solutions
   - "Back" always works

### Page Structure

```
PUBLIC PAGES:
├── / (Home)
│   └── Club info, next ride teaser, "Login" button
├── /login
│   └── Simple email/password form
└── /contact
    └── Club address, phone, simple contact form

MEMBER PAGES (after login):
├── /dashboard
│   └── "Welcome [Name]" + Next Sunday's ride prominently displayed
├── /calendar
│   └── Full season calendar, click date for details
├── /ride/[id]
│   └── Route map, stats, GPX download button
├── /events
│   └── List of upcoming events
└── /profile
    └── View own info, payment status

ADMIN PAGES:
├── /admin
│   └── Dashboard with quick stats
├── /admin/schedule
│   └── Manage season calendar, drag-drop routes
├── /admin/routes
│   └── View/upload GPX files, see suggestions
├── /admin/members
│   └── Member list, payment status toggles
└── /admin/events
    └── Create/edit events
```

---

## Wireframes (Text-Based)

### Member Dashboard (Mobile-First)

```
┌─────────────────────────────────────┐
│  🚴 Cycling Club Name               │
│  ─────────────────────────────────  │
│                                     │
│  Welkom, Jan!                       │
│                                     │
│  ╔═══════════════════════════════╗  │
│  ║  ZONDAG 15 MAART              ║  │
│  ║                               ║  │
│  ║  Route: Kempen Classic        ║  │
│  ║  🛣️ 85 km  ⛰️ 450m            ║  │
│  ║                               ║  │
│  ║  [    BEKIJK ROUTE    ]      ║  │
│  ║                               ║  │
│  ╚═══════════════════════════════╝  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  📅 Volgende ritten           │  │
│  │                               │  │
│  │  22 mrt - Hageland Tour       │  │
│  │  29 mrt - Limburg Heuvels     │  │
│  │  5 apr  - Vlaamse Ardennen    │  │
│  │                               │  │
│  │  [Bekijk volledige kalender]  │  │
│  └───────────────────────────────┘  │
│                                     │
│  ────────────────────────────────   │
│  [Home]  [Kalender]  [Profiel]      │
└─────────────────────────────────────┘
```

### Route Detail Page

```
┌─────────────────────────────────────┐
│  ← Terug                            │
│  ─────────────────────────────────  │
│                                     │
│  Kempen Classic                     │
│  Zondag 15 maart 2025 • 09:00       │
│                                     │
│  ┌───────────────────────────────┐  │
│  │                               │  │
│  │      [MAP VISUALIZATION]      │  │
│  │                               │  │
│  │    Route shown on CyclOSM     │  │
│  │                               │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  [ELEVATION PROFILE CHART]    │  │
│  └───────────────────────────────┘  │
│                                     │
│  ╭───────────╮  ╭───────────╮       │
│  │  🛣️ 85 km │  │ ⛰️ 450m   │       │
│  │  Afstand  │  │ Hoogte    │       │
│  ╰───────────╯  ╰───────────╯       │
│                                     │
│  ╭───────────╮  ╭───────────╮       │
│  │  ⏱️ ~3u   │  │ 🟡 Medium │       │
│  │  Duur     │  │ Niveau    │       │
│  ╰───────────╯  ╰───────────╯       │
│                                     │
│  Start: Clubhuis parking            │
│                                     │
│  Notities:                          │
│  Koffiestop aan km 45 bij           │
│  Café De Wielrijder                 │
│                                     │
│  ╔═══════════════════════════════╗  │
│  ║                               ║  │
│  ║   [  ⬇️ DOWNLOAD GPX FILE  ]  ║  │
│  ║                               ║  │
│  ╚═══════════════════════════════╝  │
│                                     │
└─────────────────────────────────────┘
```

### Admin Schedule Page

```
┌─────────────────────────────────────────────────────────┐
│  Admin > Seizoen 2025                                   │
│  ───────────────────────────────────────────────────    │
│                                                         │
│  [< Maart 2025 >]                                       │
│                                                         │
│  Ma  Di  Wo  Do  Vr  Za  ZO                            │
│  ──  ──  ──  ──  ──  ──  ──                            │
│                          1   ┌──────────────────┐       │
│                          🚴  │ Kempen Classic   │       │
│                              │ 85km • Bewerken  │       │
│                              └──────────────────┘       │
│   2   3   4   5   6   7   8                            │
│                          🚴  [+ Route toewijzen]        │
│                                                         │
│  ───────────────────────────────────────────────────    │
│                                                         │
│  💡 Suggesties voor 8 maart (week 2):                   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 1. Hageland Tour (82km)                         │   │
│  │    ⭐ 3x gereden in week 2 • Laatst: 2023       │   │
│  │    [Selecteer]                                  │   │
│  ├─────────────────────────────────────────────────┤   │
│  │ 2. Dijle Vallei (78km)                          │   │
│  │    ⭐ 2x gereden in week 2 • Laatst: 2024       │   │
│  │    [Selecteer]                                  │   │
│  ├─────────────────────────────────────────────────┤   │
│  │ 3. Brabant Hills (90km)                         │   │
│  │    ⭐ 1x gereden in week 2 • Laatst: 2022       │   │
│  │    [Selecteer]                                  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [Andere route kiezen...]                               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Route Visualization with BRouter

### How It Works

BRouter is primarily a **routing engine**, not a visualization tool. Since you already have GPX files and don't need route creation, here's what you actually need:

1. **Map Display**: Leaflet.js + CyclOSM tiles (free, no API key)
2. **GPX Parsing**: Built-in browser parsing or `gpxparser` library
3. **Elevation Profile**: `leaflet-elevation` plugin or custom Chart.js
4. **Stats Calculation**: Extract from GPX (distance, elevation) on upload

### Implementation Approach

```javascript
// When admin uploads a GPX file:
async function processGpxUpload(gpxString) {
  const parser = new DOMParser();
  const gpx = parser.parseFromString(gpxString, 'text/xml');
  
  // Extract track points
  const trackPoints = gpx.querySelectorAll('trkpt');
  const coordinates = [];
  const elevations = [];
  
  trackPoints.forEach(pt => {
    coordinates.push({
      lat: parseFloat(pt.getAttribute('lat')),
      lon: parseFloat(pt.getAttribute('lon'))
    });
    const ele = pt.querySelector('ele');
    if (ele) elevations.push(parseFloat(ele.textContent));
  });
  
  // Calculate total distance (Haversine formula)
  const distanceKm = calculateTotalDistance(coordinates);
  
  // Calculate elevation gain (sum of positive changes)
  const elevationGain = calculateElevationGain(elevations);
  
  return {
    gpx_data: gpxString,
    distance_km: distanceKm,
    elevation_m: elevationGain,
    coordinates: coordinates // for map bounds
  };
}
```

### Displaying Routes

```javascript
// On route detail page:
import L from 'leaflet';
import 'leaflet-gpx';

function displayRoute(gpxData, containerId) {
  const map = L.map(containerId).setView([51.0, 4.5], 10);
  
  // CyclOSM tiles - free, cycling-focused
  L.tileLayer('https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors, CyclOSM'
  }).addTo(map);
  
  // Add GPX track
  const gpxLayer = new L.GPX(gpxData, {
    async: true,
    marker_options: {
      startIconUrl: '/icons/start.png',
      endIconUrl: '/icons/finish.png',
      shadowUrl: null
    },
    polyline_options: {
      color: '#e63946',
      weight: 4,
      opacity: 0.8
    }
  }).on('loaded', function(e) {
    map.fitBounds(e.target.getBounds());
  }).addTo(map);
}
```

---

## Authentication Strategy

### Simple Email/Password (Recommended for your users)

Using NextAuth.js with Credentials provider:

```javascript
// pages/api/auth/[...nextauth].js
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Wachtwoord", type: "password" }
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });
        
        if (!user || !user.is_active) return null;
        
        const valid = await bcrypt.compare(
          credentials.password, 
          user.password_hash
        );
        
        if (!valid) return null;
        
        return {
          id: user.id,
          email: user.email,
          name: `${user.first_name} ${user.last_name}`,
          role: user.role
        };
      }
    })
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) token.role = user.role;
      return token;
    },
    session: async ({ session, token }) => {
      session.user.role = token.role;
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  }
});
```

### Password Reset Flow

1. User clicks "Wachtwoord vergeten?"
2. Enter email → system sends reset link (valid 1 hour)
3. Click link → set new password
4. Auto-login after reset

**For older users**: Consider also supporting a manual reset flow where they can call an admin.

---

## Development Phases

### Phase 1: Foundation (2-3 weeks)
- [ ] Project setup (Next.js, Prisma, PostgreSQL)
- [ ] Database schema implementation
- [ ] Authentication (login/logout)
- [ ] Basic role-based access control
- [ ] Deploy to K8s (basic)

### Phase 2: Member Features (2-3 weeks)
- [ ] Member dashboard
- [ ] Route detail page with map
- [ ] GPX download functionality
- [ ] Season calendar view
- [ ] Profile page

### Phase 3: Admin Features (3-4 weeks)
- [ ] Admin dashboard
- [ ] Member management (CRUD)
- [ ] Payment status management
- [ ] GPX upload & processing
- [ ] Schedule management
- [ ] Route suggestion algorithm

### Phase 4: Polish (1-2 weeks)
- [ ] Event management
- [ ] Responsive design refinement
- [ ] Accessibility audit
- [ ] Performance optimization
- [ ] User testing with actual members

### Phase 5: Future Enhancements (ongoing)
- [ ] Email notifications (upcoming rides)
- [ ] Ride attendance tracking
- [ ] Photo galleries per ride
- [ ] Weather integration
- [ ] Mobile app (PWA)

---

## Deployment on Kubernetes

### Basic K8s Structure

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cycling-club-web
spec:
  replicas: 2
  selector:
    matchLabels:
      app: cycling-club-web
  template:
    metadata:
      labels:
        app: cycling-club-web
    spec:
      containers:
      - name: web
        image: your-registry/cycling-club:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: cycling-club-secrets
              key: database-url
        - name: NEXTAUTH_SECRET
          valueFrom:
            secretKeyRef:
              name: cycling-club-secrets
              key: nextauth-secret
        - name: NEXTAUTH_URL
          value: "https://club.yourdomain.be"
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: cycling-club-web
spec:
  selector:
    app: cycling-club-web
  ports:
  - port: 80
    targetPort: 3000
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: cycling-club-ingress
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - club.yourdomain.be
    secretName: cycling-club-tls
  rules:
  - host: club.yourdomain.be
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: cycling-club-web
            port:
              number: 80
```

---

## Data Import Strategy

### Importing Historical GPX Files

Create a script to bulk import your existing GPX files:

```javascript
// scripts/import-gpx.js
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function importGpxFiles(directory) {
  const files = fs.readdirSync(directory).filter(f => f.endsWith('.gpx'));
  
  for (const file of files) {
    const gpxPath = path.join(directory, file);
    const gpxData = fs.readFileSync(gpxPath, 'utf-8');
    
    // Parse GPX for metadata
    const stats = parseGpxStats(gpxData);
    
    // Extract name from filename or GPX metadata
    const name = extractRouteName(file, gpxData);
    
    await prisma.route.create({
      data: {
        name: name,
        gpx_data: gpxData,
        distance_km: stats.distance,
        elevation_m: stats.elevation,
        difficulty: categorizeDifficulty(stats),
        start_location: 'Clubhuis', // default, edit later
      }
    });
    
    console.log(`Imported: ${name}`);
  }
}

// Run with: node scripts/import-gpx.js ./gpx-files/
importGpxFiles(process.argv[2]);
```

### Importing Historical Schedule

If you have spreadsheets with past schedules:

```javascript
// scripts/import-history.js
// Converts CSV/Excel of past rides into ride_history records

const csv = require('csv-parse/sync');

async function importHistory(csvPath) {
  const content = fs.readFileSync(csvPath, 'utf-8');
  const records = csv.parse(content, { columns: true });
  
  for (const row of records) {
    // Expected columns: date, route_name, participants
    const route = await prisma.route.findFirst({
      where: { name: { contains: row.route_name } }
    });
    
    if (!route) {
      console.warn(`Route not found: ${row.route_name}`);
      continue;
    }
    
    const rideDate = new Date(row.date);
    const weekNumber = calculateSeasonWeek(rideDate);
    
    await prisma.rideHistory.create({
      data: {
        route_id: route.id,
        ride_date: rideDate,
        season_year: rideDate.getFullYear(),
        week_number: weekNumber,
        participant_count: parseInt(row.participants) || null
      }
    });
  }
}
```

---

## Estimated Effort

| Component | Hours | Notes |
|-----------|-------|-------|
| Project setup & config | 8 | Next.js, Prisma, K8s manifests |
| Database & migrations | 6 | Schema, seeds, indexes |
| Authentication | 12 | Login, roles, password reset |
| Member dashboard | 8 | UI, data fetching |
| Route visualization | 16 | Map, elevation, GPX parsing |
| Calendar view | 12 | Member & admin versions |
| Admin member management | 10 | CRUD, payment status |
| Admin schedule management | 16 | Calendar UI, suggestions |
| GPX import tools | 8 | Bulk import scripts |
| Route suggestion algorithm | 8 | Historical analysis |
| Event management | 6 | Simple CRUD |
| Styling & accessibility | 12 | Large fonts, clear UI |
| Testing & bug fixes | 16 | Manual + automated |
| Documentation | 4 | Admin guide |
| **TOTAL** | **~140 hours** | |

---

## Next Steps

1. **Confirm tech stack** - Are you comfortable with Next.js or prefer something else?
2. **Share example schema** - Your yearly schedule format helps me understand the data
3. **Share sample GPX** - So I can test parsing/visualization
4. **Define MVP scope** - What's the minimum to launch before season starts?
5. **Design review** - Feedback on wireframes before building

---

## Questions for You

1. **How many members** does the club have? (affects architecture decisions)
2. **How do members currently get login credentials?** Admin creates accounts, or self-registration?
3. **What format is your historical schedule data in?** (Excel, paper, Notion, etc.)
4. **Do you want email notifications?** (e.g., reminder Friday before Sunday ride)
5. **Is there a specific deadline?** (March 2025 season start?)
6. **What domain/URL** will this be hosted on?
7. **Do you already run PostgreSQL** on your K8s cluster?
