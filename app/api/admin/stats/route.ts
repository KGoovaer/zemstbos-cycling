import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    const currentYear = new Date().getFullYear()
    const today = new Date()

    const [
      totalMembers,
      activeMembers,
      paidMembers,
      unpaidMembers,
      upcomingRides,
      totalRoutes,
      activeSeason,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({
        where: {
          paymentStatus: 'paid',
          paymentYear: currentYear,
        },
      }),
      prisma.user.count({
        where: {
          OR: [
            { paymentStatus: 'unpaid' },
            { paymentYear: { not: currentYear } },
            { paymentYear: null },
          ],
          isActive: true,
        },
      }),
      prisma.scheduledRide.count({
        where: {
          rideDate: { gte: today },
          status: 'scheduled',
        },
      }),
      prisma.route.count(),
      prisma.season.findFirst({
        where: { isActive: true },
        include: {
          _count: {
            select: { scheduledRides: true },
          },
        },
      }),
    ])

    const recentRides = await prisma.scheduledRide.findMany({
      where: {
        rideDate: { gte: today },
        status: 'scheduled',
      },
      orderBy: { rideDate: 'asc' },
      take: 5,
      include: {
        route: {
          select: {
            name: true,
            distanceKm: true,
          },
        },
      },
    })

    return NextResponse.json({
      totalMembers,
      activeMembers,
      paidMembers,
      unpaidMembers,
      upcomingRides,
      totalRoutes,
      activeSeason: activeSeason
        ? {
            year: activeSeason.year,
            totalRides: activeSeason._count.scheduledRides,
          }
        : null,
      recentRides: recentRides.map((ride) => ({
        id: ride.id,
        date: ride.rideDate,
        routeName: ride.route.name,
        distance: ride.route.distanceKm,
      })),
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
