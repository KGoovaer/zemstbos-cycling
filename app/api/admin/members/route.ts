import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function GET(request: Request) {
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
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const paymentStatus = searchParams.get('paymentStatus')

    interface WhereClause {
      OR?: Array<{
        email?: { contains: string; mode: 'insensitive' }
        firstName?: { contains: string; mode: 'insensitive' }
        lastName?: { contains: string; mode: 'insensitive' }
      }>
      isActive?: boolean
      paymentStatus?: string
    }

    const where: WhereClause = {}

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (status === 'active') {
      where.isActive = true
    } else if (status === 'inactive') {
      where.isActive = false
    }

    if (paymentStatus && paymentStatus !== 'all') {
      where.paymentStatus = paymentStatus
    }

    const members = await prisma.user.findMany({
      where,
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
        birthDate: true,
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
              },
            },
          },
        },
        isActive: true,
        createdAt: true,
      },
    })

    return NextResponse.json(members)
  } catch (error) {
    console.error('Error fetching members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
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
    const { email, firstName, lastName, phone, address, birthDate, role, paymentStatus, password } =
      body

    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, first name, and last name are required' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 400 }
      )
    }

    // Hash password if provided, otherwise set to null (they can set it on first login)
    const passwordHash = password
      ? await bcrypt.hash(password, 10)
      : null

    const member = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        phone: phone || null,
        address: address || null,
        birthDate: birthDate ? new Date(birthDate) : null,
        role: role || 'member',
        paymentStatus: paymentStatus || 'unpaid',
        paymentYear: new Date().getFullYear(),
        passwordHash,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
        birthDate: true,
        role: true,
        paymentStatus: true,
        paymentYear: true,
        isActive: true,
        createdAt: true,
      },
    })

    return NextResponse.json(member, { status: 201 })
  } catch (error) {
    console.error('Error creating member:', error)
    return NextResponse.json(
      { error: 'Failed to create member' },
      { status: 500 }
    )
  }
}
