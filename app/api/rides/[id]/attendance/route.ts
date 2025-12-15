import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// Get attendance status for current user
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!prisma) {
    return NextResponse.json(
      { error: 'Database not available' },
      { status: 503 }
    )
  }

  try {
    const attendance = await prisma.rideAttendee.findUnique({
      where: {
        rideId_userId: {
          rideId: params.id,
          userId: session.user.id,
        },
      },
    })

    return NextResponse.json({ 
      attending: attendance?.status || null 
    })
  } catch (error) {
    console.error('Error fetching attendance:', error)
    return NextResponse.json(
      { error: 'Failed to fetch attendance' },
      { status: 500 }
    )
  }
}

// Set attendance status
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()

  if (!session) {
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
    const { status } = body

    if (!status || !['attending', 'maybe', 'declined'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const attendance = await prisma.rideAttendee.upsert({
      where: {
        rideId_userId: {
          rideId: params.id,
          userId: session.user.id,
        },
      },
      update: {
        status,
      },
      create: {
        rideId: params.id,
        userId: session.user.id,
        status,
      },
    })

    return NextResponse.json(attendance)
  } catch (error) {
    console.error('Error updating attendance:', error)
    return NextResponse.json(
      { error: 'Failed to update attendance' },
      { status: 500 }
    )
  }
}

// Remove attendance
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!prisma) {
    return NextResponse.json(
      { error: 'Database not available' },
      { status: 503 }
    )
  }

  try {
    await prisma.rideAttendee.delete({
      where: {
        rideId_userId: {
          rideId: params.id,
          userId: session.user.id,
        },
      },
    })

    return NextResponse.json({ message: 'Attendance removed' })
  } catch (error) {
    console.error('Error removing attendance:', error)
    return NextResponse.json(
      { error: 'Failed to remove attendance' },
      { status: 500 }
    )
  }
}
