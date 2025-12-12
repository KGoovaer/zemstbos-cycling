import { NextResponse } from 'next/server'
import { requireApiAdmin } from '@/lib/auth/api-auth'

export async function GET() {
  const session = await requireApiAdmin()
  if (session instanceof NextResponse) return session

  return NextResponse.json({
    message: 'Admin access granted',
    user: session.user,
  })
}
