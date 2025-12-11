# 026 - Member Profile

**Epic:** Member Features
**Priority:** Must
**Estimated Effort:** 6 hours
**Phase:** 2

## User Story

As a **logged-in member**
I want **to view and update my profile information**
So that **I can keep my contact details current and see my payment status**

## Description

Create a member profile page where users can view their information, payment status, and update certain fields like phone number. This gives members visibility into their account.

## Acceptance Criteria

- [ ] Profile page shows member name, email, phone
- [ ] Payment status clearly displayed
- [ ] Payment year shown
- [ ] Can update phone number
- [ ] Password change option (if using email/password auth)
- [ ] Google account linking status shown
- [ ] Save button to update profile
- [ ] Success/error messages on update

## Technical Implementation

### Database Changes

None

### API Endpoints

- `GET /api/profile` - Fetch current user profile
- `PUT /api/profile` - Update user profile

### Components/Pages

Create `/app/(member)/profile/page.tsx`:

```typescript
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { PaymentStatusCard } from '@/components/profile/PaymentStatusCard'

export const metadata = {
  title: 'Mijn Profiel - Wielrijvereniging',
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  })

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-5xl font-bold mb-8">Mijn Profiel</h1>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <ProfileForm user={user} />
          </div>

          <div>
            <PaymentStatusCard
              status={user.paymentStatus}
              year={user.paymentYear}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
```

Create `/components/profile/ProfileForm.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function ProfileForm({ user }: { user: any }) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    phone: user.phone || '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Failed to update')

      setStatus('success')
      router.refresh()
    } catch (error) {
      setStatus('error')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-3xl font-bold mb-6">Persoonlijke Gegevens</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xl font-semibold mb-2">Naam</label>
          <input
            type="text"
            value={`${user.firstName} ${user.lastName}`}
            disabled
            className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg bg-gray-50"
          />
          <p className="text-base text-gray-500 mt-1">
            Neem contact op met de admin om je naam te wijzigen
          </p>
        </div>

        <div>
          <label className="block text-xl font-semibold mb-2">Email</label>
          <input
            type="email"
            value={user.email}
            disabled
            className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg bg-gray-50"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-xl font-semibold mb-2">
            Telefoonnummer
          </label>
          <input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-600"
          />
        </div>

        {user.googleId ? (
          <div className="bg-green-50 border-l-4 border-green-400 p-4">
            <p className="text-lg">✓ Google account gekoppeld</p>
          </div>
        ) : (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <p className="text-lg">Email/wachtwoord login actief</p>
          </div>
        )}

        {status === 'success' && (
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
            <p className="text-green-700 text-lg">Profiel succesvol bijgewerkt!</p>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-lg">Fout bij opslaan</p>
          </div>
        )}

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full bg-blue-600 text-white px-8 py-4 text-xl font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 min-h-touch"
        >
          {status === 'loading' ? 'Opslaan...' : 'Opslaan'}
        </button>
      </form>
    </div>
  )
}
```

Create `/components/profile/PaymentStatusCard.tsx`:

```typescript
export function PaymentStatusCard({
  status,
  year,
}: {
  status: string
  year: number | null
}) {
  const isPaid = status === 'paid'
  const isExempt = status === 'exempt'

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Betaalstatus</h2>

      <div
        className={`p-6 rounded-lg text-center ${
          isPaid || isExempt ? 'bg-green-50' : 'bg-yellow-50'
        }`}
      >
        <div className="text-4xl mb-2">
          {isPaid || isExempt ? '✓' : '⏳'}
        </div>
        <div className="text-xl font-semibold">
          {isPaid && 'Betaald'}
          {isExempt && 'Vrijgesteld'}
          {!isPaid && !isExempt && 'In afwachting'}
        </div>
        {year && (
          <div className="text-lg text-gray-600 mt-2">Seizoen {year}</div>
        )}
      </div>

      <p className="text-base text-gray-600 mt-4">
        Neem contact op met de admin bij vragen over je betaalstatus
      </p>
    </div>
  )
}
```

## Dependencies

- **Depends on:** 003 - Authentication

## UI/UX Notes

- Clear distinction between editable and read-only fields
- Payment status prominently displayed
- Simple, clean design

## Testing Considerations

- [ ] Profile displays correctly
- [ ] Phone update works
- [ ] Payment status shown correctly
- [ ] Read-only fields cannot be edited

## Notes

- **Limited Editing:** Most fields require admin to change
- **Security:** Users can only update their own profile
