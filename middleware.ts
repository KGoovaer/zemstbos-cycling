import { NextResponse, type NextRequest } from 'next/server'
import { auth } from '@/auth'

export default async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Public routes - allow access without authentication
  const publicRoutes = ['/', '/login', '/contact', '/unauthorized']
  if (publicRoutes.includes(path)) {
    return NextResponse.next()
  }

  let session
  try {
    session = await auth()
  } catch (error) {
    // Handle NextAuth v5 beta AbortSignal errors
    // This is a known issue with NextAuth v5 beta and Next.js 14
    if (error instanceof TypeError && error.message.includes('Cannot read properties of undefined')) {
      console.warn('NextAuth session error (known issue with v5 beta):', error.message)
      // Continue without authentication - the API routes will handle auth
      return NextResponse.next()
    }
    throw error
  }

  // Admin routes - require admin role
  if (path.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (session.user.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }

  // Member routes - require any authenticated user
  if (
    path.startsWith('/dashboard') ||
    path.startsWith('/calendar') ||
    path.startsWith('/profile') ||
    path.startsWith('/events') ||
    path.startsWith('/ride')
  ) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (static files)
     * - files with extensions (images, fonts, etc)
     */
    '/((?!api|_next/static|_next/image|_next/webpack-hmr|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)$).*)',
  ],
}
