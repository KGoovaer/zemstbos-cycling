import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { WelcomeHeader } from '@/components/dashboard/WelcomeHeader'
import { NextRideCard } from '@/components/dashboard/NextRideCard'
import { UpcomingRides } from '@/components/dashboard/UpcomingRides'
import { QuickLinks } from '@/components/dashboard/QuickLinks'
import { PaymentStatus } from '@/components/dashboard/PaymentStatus'

export const metadata = {
  title: 'Dashboard - Zemst BOS Cycling Club',
  description: 'Member dashboard',
}

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <WelcomeHeader name={session.user.name} />

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <NextRideCard />
            <UpcomingRides />
          </div>

          <div className="space-y-6">
            <PaymentStatus userId={session.user.id} />
            <QuickLinks />
          </div>
        </div>
      </div>
    </div>
  )
}
