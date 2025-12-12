import { NextResponse } from 'next/server'
import { requireApiAuth } from '@/lib/auth/api-auth'

export async function GET() {
  const session = await requireApiAuth()
  if (session instanceof NextResponse) return session

  return NextResponse.json({
    message: 'Member access granted',
    user: session.user,
  })
}
