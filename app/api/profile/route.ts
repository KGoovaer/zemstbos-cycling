import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!prisma) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 500 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
        preferredGroup: true,
        birthDate: true,
        role: true,
        paymentStatus: true,
        paymentYear: true,
        googleId: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!prisma) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { phone, address, preferredGroup } = body

    // Validate preferredGroup if provided
    if (
      preferredGroup !== undefined &&
      preferredGroup !== null &&
      preferredGroup !== '' &&
      !['A', 'B', 'C'].includes(preferredGroup)
    ) {
      return NextResponse.json(
        { error: 'Ongeldige groep selectie. Kies A, B of C.' },
        { status: 400 }
      )
    }

    // Only allow updating phone number, address, and preferred group
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        phone: phone || null,
        address: address || null,
        preferredGroup: preferredGroup === '' ? null : preferredGroup,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
        preferredGroup: true,
        birthDate: true,
        role: true,
        paymentStatus: true,
        paymentYear: true,
        googleId: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
