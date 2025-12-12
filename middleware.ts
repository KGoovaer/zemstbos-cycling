import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export default auth((req) => {
  const token = req.auth
  const path = req.nextUrl.pathname

  // Admin routes - require admin role
  if (path.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    if (token.user.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
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
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  return NextResponse.next()
})

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
