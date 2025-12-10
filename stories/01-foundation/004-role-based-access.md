# 004 - Role-Based Access Control

**Epic:** Foundation
**Priority:** Must
**Estimated Effort:** 4 hours
**Phase:** 1

## User Story

As a **system administrator**
I want **role-based access control enforced throughout the application**
So that **members can only access member features and admins can access admin features**

## Description

Implement comprehensive role-based access control (RBAC) system that restricts access to pages and API endpoints based on user roles. The system supports three access levels: public (no authentication), member (authenticated users), and admin (authenticated users with admin role).

Middleware and helper functions will enforce these permissions consistently across the application.

## Acceptance Criteria

- [ ] Middleware checks authentication and role on all protected routes
- [ ] Public pages accessible without authentication
- [ ] Member pages require authentication
- [ ] Admin pages require authentication AND admin role
- [ ] API endpoints enforce same access control as pages
- [ ] Unauthorized access redirects to login page
- [ ] Insufficient permissions show appropriate error message
- [ ] Helper functions available for checking permissions in components
- [ ] TypeScript types defined for user roles
- [ ] Session includes role information

## Technical Implementation

### Database Changes

None (uses existing `role` field from User model)

### API Endpoints

**Helper API Route for Permission Checking:**
- `GET /api/auth/check-role` - Verify current user's role

### Components/Pages

**Middleware:**
- `/middleware.ts` - Next.js middleware for route protection

**Helper Functions:**
- `/lib/auth/permissions.ts` - Permission checking utilities
- `/lib/auth/withAuth.ts` - HOC for protecting pages
- `/lib/auth/withRole.ts` - HOC for role-based page protection

**Components:**
- `/components/auth/Unauthorized.tsx` - 403 error component

**Types:**
- `/types/auth.ts` - TypeScript types for roles and permissions

### Libraries/Dependencies

No additional dependencies required (uses Next.js and NextAuth.js)

### Middleware Implementation

Create `/middleware.ts`:

```typescript
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Admin routes - require admin role
    if (path.startsWith('/admin')) {
      if (token?.role !== 'admin') {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
    }

    // Member routes - require any authenticated user
    if (path.startsWith('/dashboard') ||
        path.startsWith('/calendar') ||
        path.startsWith('/profile') ||
        path.startsWith('/events') ||
        path.startsWith('/ride')) {
      if (!token) {
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/calendar/:path*',
    '/profile/:path*',
    '/events/:path*',
    '/ride/:path*',
  ],
}
```

### Permission Helpers

Create `/lib/auth/permissions.ts`:

```typescript
import { Session } from 'next-auth'

export type UserRole = 'admin' | 'member'

export function isAdmin(session: Session | null): boolean {
  return session?.user?.role === 'admin'
}

export function isMember(session: Session | null): boolean {
  return session?.user?.role === 'member' || session?.user?.role === 'admin'
}

export function canManageMembers(session: Session | null): boolean {
  return isAdmin(session)
}

export function canManageRoutes(session: Session | null): boolean {
  return isAdmin(session)
}

export function canManageSchedule(session: Session | null): boolean {
  return isAdmin(session)
}

export function canViewMemberContent(session: Session | null): boolean {
  return isMember(session)
}

export function canDownloadGPX(session: Session | null): boolean {
  return isMember(session)
}

export function requireAuth(session: Session | null): asserts session is Session {
  if (!session) {
    throw new Error('Authentication required')
  }
}

export function requireAdmin(session: Session | null): asserts session is Session {
  requireAuth(session)
  if (!isAdmin(session)) {
    throw new Error('Admin access required')
  }
}
```

### API Route Protection

Create `/lib/auth/api-auth.ts`:

```typescript
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { NextResponse } from 'next/server'

export async function requireApiAuth() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  return session
}

export async function requireApiAdmin() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  if (session.user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    )
  }

  return session
}

// Usage in API route:
// const session = await requireApiAdmin()
// if (session instanceof NextResponse) return session
```

### Client Component Protection

Create `/components/auth/RequireAuth.tsx`:

```typescript
'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { ReactNode } from 'react'

interface RequireAuthProps {
  children: ReactNode
  requiredRole?: 'admin' | 'member'
  fallback?: ReactNode
}

export function RequireAuth({ children, requiredRole, fallback }: RequireAuthProps) {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return fallback || <div>Loading...</div>
  }

  if (!session) {
    redirect('/login')
  }

  if (requiredRole === 'admin' && session.user.role !== 'admin') {
    return <Unauthorized />
  }

  return <>{children}</>
}
```

### Unauthorized Page

Create `/app/unauthorized/page.tsx`:

```typescript
import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center space-y-4 p-8">
        <h1 className="text-4xl font-bold text-gray-900">403</h1>
        <h2 className="text-2xl font-semibold text-gray-700">
          Geen toegang
        </h2>
        <p className="text-lg text-gray-600">
          Je hebt geen toestemming om deze pagina te bekijken.
        </p>
        <p className="text-base text-gray-500">
          Deze pagina is alleen toegankelijk voor beheerders.
        </p>
        <Link
          href="/"
          className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white text-lg rounded-lg hover:bg-blue-700 min-h-touch"
        >
          Terug naar home
        </Link>
      </div>
    </div>
  )
}
```

### TypeScript Types

Create `/types/auth.ts`:

```typescript
import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: 'admin' | 'member'
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: 'admin' | 'member'
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: 'admin' | 'member'
    userId: string
  }
}
```

## Dependencies

- **Depends on:** 003 - Authentication
- **Blocks:** All member and admin feature stories

## UI/UX Notes

**Error Messages:**
- Use simple, clear Dutch language
- "Geen toegang" instead of "Unauthorized"
- "Je moet inloggen" instead of "Authentication required"
- "Alleen voor beheerders" instead of "Admin only"

**Visual Design:**
- Large, readable text for error messages
- Clear call-to-action button to go back
- No technical jargon in user-facing messages

## Testing Considerations

- [ ] Unauthenticated users redirected to login for protected pages
- [ ] Members can access member pages but not admin pages
- [ ] Admins can access both member and admin pages
- [ ] Public pages accessible without authentication
- [ ] API endpoints enforce same permissions as pages
- [ ] Unauthorized access shows appropriate error message
- [ ] Direct URL access to protected pages is blocked
- [ ] Session expiry properly handled
- [ ] TypeScript types prevent role string typos

## Implementation Steps

1. Create middleware.ts with route protection
2. Create permission helper functions
3. Create API route protection utilities
4. Create RequireAuth client component
5. Create Unauthorized page
6. Add TypeScript type definitions
7. Test all permission scenarios
8. Document permission system for other developers

## Route Protection Summary

**Public Routes (No Auth Required):**
- `/` - Landing page
- `/login` - Login page
- `/contact` - Contact page

**Member Routes (Auth Required):**
- `/dashboard` - Member dashboard
- `/calendar` - Season calendar
- `/ride/*` - Route details
- `/events` - Events list
- `/profile` - User profile

**Admin Routes (Auth + Admin Role Required):**
- `/admin` - Admin dashboard
- `/admin/members` - Member management
- `/admin/routes` - Route management
- `/admin/schedule` - Schedule management
- `/admin/events` - Event management

## API Endpoint Protection

**Public API:**
- `GET /api/rides/next` - Next upcoming ride
- `GET /api/contact` - Contact form submission

**Member API:**
- `GET /api/rides` - All scheduled rides
- `GET /api/rides/[id]` - Ride details
- `GET /api/routes/[id]/gpx` - Download GPX
- `GET /api/events` - All events
- `GET /api/profile` - Current user profile

**Admin API:**
- `POST /api/admin/members` - Create member
- `PUT /api/admin/members/[id]` - Update member
- `DELETE /api/admin/members/[id]` - Deactivate member
- `POST /api/admin/routes` - Upload route
- `POST /api/admin/schedule` - Create scheduled ride
- `PUT /api/admin/schedule/[id]` - Update scheduled ride

## Notes

- **Middleware Performance:** Next.js middleware runs on every request - keep it fast
- **Server Components:** For server components, use `getServerSession()` directly
- **Client Components:** For client components, use `useSession()` hook
- **API Routes:** Use `requireApiAuth()` or `requireApiAdmin()` helpers
- **Granular Permissions:** Can add more specific permissions later if needed
- **Audit Logging:** Consider adding audit log for admin actions (future enhancement)
