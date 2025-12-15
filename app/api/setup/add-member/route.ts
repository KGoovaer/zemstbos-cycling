import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST() {
  if (!prisma) {
    return NextResponse.json(
      { error: 'Database not available' },
      { status: 503 }
    )
  }

  try {
    // Check if member already exists
    const existing = await prisma.user.findUnique({
      where: { email: 'member@cyclingclub.be' },
    })

    if (existing) {
      return NextResponse.json({
        message: 'Member account already exists',
        email: 'member@cyclingclub.be',
      })
    }

    const hashedPassword = await bcrypt.hash('member123', 10)

    const member = await prisma.user.create({
      data: {
        email: 'member@cyclingclub.be',
        passwordHash: hashedPassword,
        firstName: 'Jan',
        lastName: 'Janssen',
        phone: '+32 477 12 34 56',
        role: 'member',
        paymentStatus: 'paid',
        paymentYear: 2025,
        isActive: true,
      },
    })

    return NextResponse.json({
      message: 'Member account created successfully',
      email: member.email,
      name: `${member.firstName} ${member.lastName}`,
      role: member.role,
      credentials: {
        email: 'member@cyclingclub.be',
        password: 'member123',
      },
    })
  } catch (error) {
    console.error('Error creating member:', error)
    return NextResponse.json(
      { error: 'Failed to create member account' },
      { status: 500 }
    )
  }
}
