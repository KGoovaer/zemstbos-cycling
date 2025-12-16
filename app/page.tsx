import { auth } from '@/auth'
import { Hero } from '@/components/landing/Hero'
import { About } from '@/components/landing/About'
import { NextRideWrapper } from '@/components/landing/NextRideWrapper'
import { CallToAction } from '@/components/landing/CallToAction'
import { WelcomeHeader } from '@/components/dashboard/WelcomeHeader'
import { NextRideCard } from '@/components/dashboard/NextRideCard'
import { UpcomingRides } from '@/components/dashboard/UpcomingRides'
import { QuickLinks } from '@/components/dashboard/QuickLinks'
import { PaymentStatus } from '@/components/dashboard/PaymentStatus'

export const metadata = {
  title: 'Zemst BOS Cycling Club - Zondag Ritten Maart-Oktober',
  description: 'Sluit je aan bij Zemst BOS Cycling Club voor zondagritten van maart tot oktober. Ontdek prachtige routes en rij samen met andere fietsliefhebbers.',
  keywords: ['wielrijvereniging', 'fietsen', 'zondagritten', 'Vlaanderen', 'fietsclub', 'Zemst', 'BOS'],
  openGraph: {
    title: 'Zemst BOS Cycling Club',
    description: 'Zondag fietsritten van maart tot oktober',
    type: 'website',
  },
}

export default async function HomePage() {
  const session = await auth()

  // If logged in, show dashboard content
  if (session) {
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

  // If not logged in, show public landing page
  return (
    <main>
      <Hero />
      <NextRideWrapper />
      <About />
      <CallToAction />
    </main>
  )
}
