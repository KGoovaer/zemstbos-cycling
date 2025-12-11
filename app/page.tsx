import { Hero } from '@/components/landing/Hero'
import { About } from '@/components/landing/About'
import { NextRideWrapper } from '@/components/landing/NextRideWrapper'
import { CallToAction } from '@/components/landing/CallToAction'

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

export default function HomePage() {
  return (
    <main>
      <Hero />
      <NextRideWrapper />
      <About />
      <CallToAction />
    </main>
  )
}
