import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function GET(
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
        isActive: true,
        createdAt: true,
      },
    })

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    return NextResponse.json(member)
  } catch (error) {
    console.error('Error fetching member:', error)
    return NextResponse.json(
      { error: 'Failed to fetch member' },
      { status: 500 }
    )
  }
}

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
      email,
      firstName,
      lastName,
      phone,
      role,
      paymentStatus,
      paymentYear,
      password,
    } = body

    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, first name, and last name are required' },
        { status: 400 }
      )
    }

    // Check if email is being changed to one that already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser && existingUser.id !== params.id) {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 400 }
      )
    }

    interface UpdateData {
      email: string
      firstName: string
      lastName: string
      phone: string | null
      role: string
      paymentStatus: string
      paymentYear: number
      passwordHash?: string
    }

    const updateData: UpdateData = {
      email,
      firstName,
      lastName,
      phone: phone || null,
      role: role || 'member',
      paymentStatus: paymentStatus || 'unpaid',
      paymentYear: paymentYear || new Date().getFullYear(),
    }

    // Only update password if provided
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10)
    }

    const member = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
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
    console.error('Error updating member:', error)
    return NextResponse.json(
      { error: 'Failed to update member' },
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
    // Soft delete - set isActive to false
    const member = await prisma.user.update({
      where: { id: params.id },
      data: { isActive: false },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
      },
    })

    return NextResponse.json(member)
  } catch (error) {
    console.error('Error deactivating member:', error)
    return NextResponse.json(
      { error: 'Failed to deactivate member' },
      { status: 500 }
    )
  }
}
