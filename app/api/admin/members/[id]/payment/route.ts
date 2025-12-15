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
    const { paymentStatus, paidSeasonId } = body

    if (!paymentStatus) {
      return NextResponse.json(
        { error: 'Payment status is required' },
        { status: 400 }
      )
    }

    const member = await prisma.user.update({
      where: { id: params.id },
      data: {
        paymentStatus,
        paidSeasonId: paidSeasonId || null,
      },
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
