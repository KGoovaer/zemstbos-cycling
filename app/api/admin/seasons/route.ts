import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
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
    const seasons = await prisma.season.findMany({
      orderBy: { year: 'desc' },
    })

    return NextResponse.json(seasons)
  } catch (error) {
    console.error('Error fetching seasons:', error)
    return NextResponse.json(
      { error: 'Failed to fetch seasons' },
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
    const { year, startDate, endDate, isActive } = body

    if (!year || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // If setting as active, deactivate all other seasons
    if (isActive) {
      await prisma.season.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      })
    }

    const season = await prisma.season.create({
      data: {
        year,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: isActive || false,
      },
    })

    return NextResponse.json(season, { status: 201 })
  } catch (error) {
    console.error('Error creating season:', error)
    return NextResponse.json(
      { error: 'Failed to create season' },
      { status: 500 }
    )
  }
}
