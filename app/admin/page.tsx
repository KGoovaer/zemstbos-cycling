import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { StatsCard } from '@/components/admin/StatsCard'
import { QuickActions } from '@/components/admin/QuickActions'

interface RecentRide {
  id: string
  date: string
  routeName: string
  distance: number
}

interface AdminStats {
  totalMembers: number
  activeMembers: number
  paidMembers: number
  unpaidMembers: number
  upcomingRides: number
  totalRoutes: number
  activeSeason: {
    year: number
    totalRides: number
  } | null
  recentRides: RecentRide[]
}

async function getAdminStats(): Promise<AdminStats | null> {
  try {
    const { prisma } = await import('@/lib/prisma')
    
    if (!prisma) {
      return null
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

    return {
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
        date: ride.rideDate.toISOString(),
        routeName: ride.route.name,
        distance: Number(ride.route.distanceKm),
      })),
    }
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return null
  }
}

export default async function AdminPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  if (session.user.role !== 'admin') {
    redirect('/unauthorized')
  }

  const stats = await getAdminStats()

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-xl text-gray-600">
            Welkom, {session.user.name}! Beheer je wielerclub.
          </p>
        </div>

        {stats ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
              <StatsCard
                title="Totaal Leden"
                value={stats.totalMembers}
                subtitle={`${stats.activeMembers} actief`}
                icon={
                  <svg
                    className="w-12 h-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                }
              />

              <StatsCard
                title="Betalingen"
                value={stats.paidMembers}
                subtitle={`${stats.unpaidMembers} onbetaald`}
                icon={
                  <svg
                    className="w-12 h-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
              />

              <StatsCard
                title="Aankomende Ritten"
                value={stats.upcomingRides}
                subtitle={
                  stats.activeSeason
                    ? `Seizoen ${stats.activeSeason.year}`
                    : 'Geen actief seizoen'
                }
                icon={
                  <svg
                    className="w-12 h-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                }
              />

              <Link href="/admin/routes" className="block">
                <StatsCard
                  title="Route Bibliotheek"
                  value={stats.totalRoutes}
                  subtitle="Beschikbare routes"
                  icon={
                    <svg
                      className="w-12 h-12"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                      />
                    </svg>
                  }
                />
              </Link>
            </div>

            {stats.recentRides.length > 0 && (
              <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Aankomende Ritten
                </h2>
                <div className="space-y-3">
                  {stats.recentRides.map((ride) => (
                    <div
                      key={ride.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div>
                        <p className="font-semibold text-lg text-gray-900">
                          {ride.routeName}
                        </p>
                        <p className="text-gray-600">
                          {new Date(ride.date).toLocaleDateString('nl-BE', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <span className="text-blue-600 font-semibold text-lg">
                        {ride.distance} km
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Snelle Acties
              </h2>
              <QuickActions />
            </div>
          </>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-800 text-lg">
              Kon statistieken niet laden. Probeer de pagina te verversen.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
