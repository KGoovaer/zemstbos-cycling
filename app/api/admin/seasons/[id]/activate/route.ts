import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PUT(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!prisma) {
    return NextResponse.json(
      { error: 'Database not available' },
      { status: 503 }
    )
  }

  try {
    // Deactivate all seasons first
    await prisma.season.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    })

    // Activate the selected season
    const season = await prisma.season.update({
      where: { id: params.id },
      data: { isActive: true },
    })

    return NextResponse.json(season)
  } catch (error) {
    console.error('Error activating season:', error)
    return NextResponse.json(
      { error: 'Failed to activate season' },
      { status: 500 }
    )
  }
}
