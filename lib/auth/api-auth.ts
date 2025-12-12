import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function requireApiAuth() {
  const session = await auth()

  if (!session) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  return session
}

export async function requireApiAdmin() {
  const session = await auth()

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
