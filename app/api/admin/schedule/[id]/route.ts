import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PUT(
  request: Request,
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
    const body = await request.json()
    const {
      routeId,
      rideDate,
      team,
      startTime,
      status,
      notes,
      weatherBackup,
    } = body

    const scheduledRide = await prisma.scheduledRide.update({
      where: { id: params.id },
      data: {
        ...(routeId && { routeId }),
        ...(rideDate && { rideDate: new Date(rideDate) }),
        ...(team && { team }),
        ...(startTime && { startTime }),
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
        ...(weatherBackup !== undefined && { weatherBackup }),
      },
      include: {
        route: true,
        backupRoute: true,
      },
    })

    return NextResponse.json(scheduledRide)
  } catch (error) {
    console.error('Error updating scheduled ride:', error)
    return NextResponse.json(
      { error: 'Failed to update scheduled ride' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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
    await prisma.scheduledRide.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Scheduled ride deleted' })
  } catch (error) {
    console.error('Error deleting scheduled ride:', error)
    return NextResponse.json(
      { error: 'Failed to delete scheduled ride' },
      { status: 500 }
    )
  }
}
