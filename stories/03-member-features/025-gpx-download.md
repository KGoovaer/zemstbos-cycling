# 025 - GPX Download

**Epic:** Member Features
**Priority:** Must
**Estimated Effort:** 3 hours
**Phase:** 2

## User Story

As a **logged-in member**
I want **to download the GPX file for a route**
So that **I can load it on my GPS device or cycling computer**

## Description

Allow members to download GPX files for routes so they can navigate using their own devices. The download should provide a properly formatted GPX file with correct filename.

## Acceptance Criteria

- [ ] Download button visible on route detail page
- [ ] Button click downloads GPX file
- [ ] Filename includes route name
- [ ] File is valid GPX format
- [ ] Works on all browsers
- [ ] Large, accessible button
- [ ] Only accessible to authenticated members

## Technical Implementation

### Database Changes

None

### API Endpoints

Create `/app/api/routes/[id]/download/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const route = await prisma.route.findUnique({
    where: { id: params.id },
    select: {
      name: true,
      gpxData: true,
    }
  })

  if (!route) {
    return NextResponse.json({ error: 'Route not found' }, { status: 404 })
  }

  // Create filename (sanitize route name)
  const filename = `${route.name.replace(/[^a-z0-9]/gi, '_')}.gpx`

  return new NextResponse(route.gpxData, {
    headers: {
      'Content-Type': 'application/gpx+xml',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
```

### Components/Pages

Create `/components/routes/DownloadGPXButton.tsx`:

```typescript
'use client'

export function DownloadGPXButton({
  routeId,
  routeName,
}: {
  routeId: string
  routeName: string
}) {
  const handleDownload = () => {
    window.location.href = `/api/routes/${routeId}/download`
  }

  return (
    <button
      onClick={handleDownload}
      className="w-full bg-green-600 text-white px-8 py-4 text-xl font-semibold rounded-lg hover:bg-green-700 min-h-touch flex items-center justify-center gap-3"
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>
      Download GPX bestand
    </button>
  )
}
```

## Dependencies

- **Depends on:** 003 - Authentication, 022 - Route Detail

## UI/UX Notes

- Prominent download button
- Clear icon indicating download action
- Green color (positive action)
- Works with single click

## Testing Considerations

- [ ] Download works in Chrome
- [ ] Download works in Safari
- [ ] Download works in Firefox
- [ ] Filename is correct
- [ ] GPX file is valid
- [ ] Unauthorized users blocked

## Notes

- **GPX Validation:** Ensure GPX data is well-formed before download
