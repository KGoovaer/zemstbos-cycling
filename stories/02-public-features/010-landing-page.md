# 010 - Landing Page - Done

**Epic:** Public Features
**Priority:** Must
**Estimated Effort:** 6 hours
**Phase:** 2

## User Story

As a **visitor to the website**
I want **to see club information and what the club offers on the homepage**
So that **I can learn about the cycling club and decide if I want to join**

## Description

Create an attractive, accessible landing page that serves as the public face of the cycling club. The page should include club information, a teaser of the next upcoming ride, and clear calls-to-action for logging in or contacting the club.

The design must be simple, welcoming, and optimized for older users with large text and clear navigation.

## Acceptance Criteria

- [ ] Landing page displays club name and logo
- [ ] Brief club description/welcome message visible
- [ ] Next upcoming ride teaser displayed (see story 011)
- [ ] Login button prominently placed
- [ ] Contact link clearly visible
- [ ] Responsive design works on mobile, tablet, and desktop
- [ ] Images load efficiently
- [ ] High contrast design for accessibility
- [ ] Page loads in under 3 seconds
- [ ] SEO metadata configured

## Technical Implementation

### Database Changes

None (reads from existing scheduled_rides table)

### API Endpoints

- `GET /api/rides/next` - Fetch next upcoming ride (public endpoint)

### Components/Pages

**Pages:**
- `/app/page.tsx` - Homepage/landing page

**Components:**
- `/components/landing/Hero.tsx` - Hero section with club name
- `/components/landing/About.tsx` - About the club section
- `/components/landing/NextRide.tsx` - Next ride teaser (links to story 011)
- `/components/landing/CallToAction.tsx` - Login/contact buttons

**Layout:**
- `/components/layout/PublicHeader.tsx` - Header with nav
- `/components/layout/PublicFooter.tsx` - Footer with links

### Libraries/Dependencies

No additional dependencies (uses Next.js Image component)

### Landing Page Structure

Create `/app/page.tsx`:

```typescript
import { Hero } from '@/components/landing/Hero'
import { About } from '@/components/landing/About'
import { NextRide } from '@/components/landing/NextRide'
import { CallToAction } from '@/components/landing/CallToAction'

export const metadata = {
  title: 'Wielrijvereniging - Zondag Ritten Maart-Oktober',
  description: 'Sluit je aan bij onze wielrijvereniging voor zondagritten van maart tot oktober. Ontdek prachtige routes en rij samen met andere fietsliefhebbers.',
}

export default function HomePage() {
  return (
    <main>
      <Hero />
      <NextRide />
      <About />
      <CallToAction />
    </main>
  )
}
```

### Hero Component

Create `/components/landing/Hero.tsx`:

```typescript
import Link from 'next/link'

export function Hero() {
  return (
    <section className="bg-gradient-to-b from-blue-600 to-blue-800 text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Welkom bij Wielrijvereniging
        </h1>
        <p className="text-2xl md:text-3xl mb-8 max-w-3xl mx-auto">
          Zondag fietsritten van maart tot oktober
        </p>
        <p className="text-xl mb-12 max-w-2xl mx-auto">
          Sluit je aan bij onze groep fietsliefhebbers voor prachtige ritten door Vlaanderen
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/login"
            className="bg-white text-blue-600 px-8 py-4 text-xl font-semibold rounded-lg hover:bg-gray-100 min-h-touch min-w-[200px]"
          >
            Aanmelden
          </Link>
          <Link
            href="/contact"
            className="bg-blue-700 text-white px-8 py-4 text-xl font-semibold rounded-lg hover:bg-blue-900 min-h-touch min-w-[200px]"
          >
            Contact
          </Link>
        </div>
      </div>
    </section>
  )
}
```

### About Component

Create `/components/landing/About.tsx`:

```typescript
export function About() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-4xl font-bold text-center mb-8">
          Over Onze Club
        </h2>
        <div className="text-xl leading-relaxed space-y-4">
          <p>
            Welkom bij onze wielrijvereniging! Elk seizoen, van maart tot oktober,
            trekken wij er elke zondag op uit voor een mooie fietstocht.
          </p>
          <p>
            Of je nu een doorgewinterde fietser bent of gewoon graag buiten bent,
            iedereen is welkom. We rijden routes tussen de 60 en 100 kilometer
            door de mooiste streken van Vlaanderen.
          </p>
          <p>
            Onze ritten starten om 9:00 uur en we stoppen onderweg altijd voor
            een gezellige koffiepauze. Samen fietsen, samen genieten!
          </p>
        </div>
      </div>
    </section>
  )
}
```

## Dependencies

- **Depends on:** 001 - Project Setup, 002 - Database Schema
- **Related:** 011 - Ride Teaser (displays next ride)
- **Blocks:** Public user experience

## UI/UX Notes

**Accessibility Requirements:**
- Minimum 18px base font size (headings much larger)
- High contrast between text and background
- Touch targets minimum 48x48px
- Clear, simple language
- Logical heading hierarchy (h1, h2, h3)

**Design Principles:**
- Clean, uncluttered layout
- Large, easy-to-read text
- Clear visual hierarchy
- Obvious call-to-action buttons
- Friendly, welcoming tone

**Color Scheme:**
- Primary: Blue (cycling theme)
- Secondary: White/Light gray
- Text: Dark gray/black on light backgrounds
- High contrast for readability

## Testing Considerations

- [ ] Page loads without errors
- [ ] All sections visible and properly styled
- [ ] Links work correctly
- [ ] Responsive on mobile devices
- [ ] Images load and display correctly
- [ ] Text is readable on all screen sizes
- [ ] Call-to-action buttons are clearly visible
- [ ] SEO metadata appears in page source
- [ ] Page passes Lighthouse accessibility audit

## Implementation Steps

1. Create app/page.tsx with basic structure
2. Create Hero component with club name and CTA
3. Create About component with club description
4. Create NextRide component placeholder (full implementation in story 011)
5. Create CallToAction component
6. Add responsive styling with Tailwind
7. Configure SEO metadata
8. Add club logo/images
9. Test on multiple devices
10. Run accessibility audit

## SEO Metadata

```typescript
export const metadata = {
  title: 'Wielrijvereniging - Zondag Ritten Maart-Oktober',
  description: 'Sluit je aan bij onze wielrijvereniging voor zondagritten van maart tot oktober.',
  keywords: ['wielrijvereniging', 'fietsen', 'zondagritten', 'Vlaanderen', 'fietsclub'],
  openGraph: {
    title: 'Wielrijvereniging',
    description: 'Zondag fietsritten van maart tot oktober',
    type: 'website',
  },
}
```

## Notes

- **Club Name:** Replace "Wielrijvereniging" with actual club name
- **Images:** Add club logo and photo of group ride
- **Content:** Club description should be updated with actual club information
- **Season Dates:** Specify actual season dates (currently generic March-October)
- **Meeting Point:** Add information about where rides start from
