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
    const { seasonId, action } = body

    if (!seasonId) {
      return NextResponse.json(
        { error: 'Season ID is required' },
        { status: 400 }
      )
    }

    // Handle payment action
    if (action === 'paid') {
      // Create or update season payment record
      await prisma.seasonPayment.upsert({
        where: {
          userId_seasonId: {
            userId: params.id,
            seasonId: seasonId,
          },
        },
        create: {
          userId: params.id,
          seasonId: seasonId,
        },
        update: {}, // Already exists, do nothing
      })
    } else if (action === 'unpaid') {
      // Delete season payment record
      await prisma.seasonPayment.deleteMany({
        where: {
          userId: params.id,
          seasonId: seasonId,
        },
      })
    } else if (action === 'exempt') {
      // Update user status to exempt (clears all payments)
      await prisma.user.update({
        where: { id: params.id },
        data: { paymentStatus: 'exempt' },
      })
    } else if (action === 'unexempt') {
      // Remove exempt status
      await prisma.user.update({
        where: { id: params.id },
        data: { paymentStatus: 'unpaid' },
      })
    }

    // Fetch updated member with all season payments
    const member = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        paymentStatus: true,
        paymentYear: true,
        paidSeasonId: true,
        paidSeason: {
          select: {
            id: true,
            year: true,
            startDate: true,
            endDate: true,
            isActive: true,
          },
        },
        seasonPayments: {
          select: {
            id: true,
            seasonId: true,
            paidAt: true,
            season: {
              select: {
                id: true,
                year: true,
                startDate: true,
                endDate: true,
                isActive: true,
              },
            },
          },
        },
        isActive: true,
        createdAt: true,
      },
    })

    return NextResponse.json(member)
  } catch (error) {
    console.error('Error updating payment status:', error)
    return NextResponse.json(
      { error: 'Failed to update payment status' },
      { status: 500 }
    )
  }
}
