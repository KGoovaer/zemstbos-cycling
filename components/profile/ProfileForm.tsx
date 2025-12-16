'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string | null
  address: string | null
  birthDate: Date | null
  role: string
  paymentStatus: string
  paymentYear: number | null
  googleId: string | null
}

export function ProfileForm({ user }: { user: User }) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    phone: user.phone || '',
    address: user.address || '',
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
    } catch {
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
            className="w-full px-4 py-3 text-lg border-2 border-slate-300 rounded-lg bg-slate-50"
          />
          <p className="text-base text-slate-700 mt-1">
            Neem contact op met de admin om je naam te wijzigen
          </p>
        </div>

        <div>
          <label className="block text-xl font-semibold mb-2">Email</label>
          <input
            type="email"
            value={user.email}
            disabled
            className="w-full px-4 py-3 text-lg border-2 border-slate-300 rounded-lg bg-slate-50"
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
            className="w-full px-4 py-3 text-lg border-2 border-slate-300 rounded-lg focus:border-blue-600"
          />
        </div>

        <div>
          <label htmlFor="address" className="block text-xl font-semibold mb-2">
            Adres
          </label>
          <input
            id="address"
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-4 py-3 text-lg border-2 border-slate-300 rounded-lg focus:border-blue-600"
          />
        </div>

        <div>
          <label className="block text-xl font-semibold mb-2">
            Geboortedatum
          </label>
          <input
            type="text"
            value={user.birthDate ? new Date(user.birthDate).toLocaleDateString('nl-BE') : 'Niet ingevuld'}
            disabled
            className="w-full px-4 py-3 text-lg border-2 border-slate-300 rounded-lg bg-slate-50"
          />
          <p className="text-base text-slate-700 mt-1">
            Neem contact op met de admin om je geboortedatum te wijzigen
          </p>
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
