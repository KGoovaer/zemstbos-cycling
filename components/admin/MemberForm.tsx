'use client'

import { useState, useEffect } from 'react'

interface Member {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string | null
  role: string
  paymentStatus: string
  paymentYear: number | null
}

interface Props {
  member?: Member | null
  onClose: () => void
  onSuccess: () => void
}

export function MemberForm({ member, onClose, onSuccess }: Props) {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState('member')
  const [paymentStatus, setPaymentStatus] = useState('unpaid')
  const [paymentYear, setPaymentYear] = useState(new Date().getFullYear())
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (member) {
      setEmail(member.email)
      setFirstName(member.firstName)
      setLastName(member.lastName)
      setPhone(member.phone || '')
      setRole(member.role)
      setPaymentStatus(member.paymentStatus)
      setPaymentYear(member.paymentYear || new Date().getFullYear())
    }
  }, [member])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !firstName || !lastName) {
      alert('Email, voornaam en achternaam zijn verplicht')
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      alert('Voer een geldig email adres in')
      return
    }

    setLoading(true)

    try {
      const url = member
        ? `/api/admin/members/${member.id}`
        : '/api/admin/members'

      const method = member ? 'PUT' : 'POST'

      interface RequestBody {
        email: string
        firstName: string
        lastName: string
        phone: string | null
        role: string
        paymentStatus: string
        paymentYear: number
        password?: string
      }

      const body: RequestBody = {
        email,
        firstName,
        lastName,
        phone: phone || null,
        role,
        paymentStatus,
        paymentYear,
      }

      // Only include password if it's provided
      if (password) {
        body.password = password
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        onSuccess()
      } else {
        const error = await response.json()
        alert(error.error || 'Fout bij opslaan van lid')
      }
    } catch (error) {
      console.error('Error saving member:', error)
      alert('Fout bij opslaan van lid')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-gray-900">
              {member ? 'Lid Bewerken' : 'Nieuw Lid'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-4xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="firstName"
                className="block text-lg font-semibold text-gray-900 mb-2"
              >
                Voornaam *
              </label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Jan"
              />
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="block text-lg font-semibold text-gray-900 mb-2"
              >
                Achternaam *
              </label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Janssens"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-lg font-semibold text-gray-900 mb-2"
            >
              Email *
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="jan.janssens@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-lg font-semibold text-gray-900 mb-2"
            >
              Telefoon (optioneel)
            </label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+32 123 45 67 89"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-lg font-semibold text-gray-900 mb-2"
            >
              Wachtwoord {member ? '(laat leeg om ongewijzigd te laten)' : '*'}
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!member}
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
            {!member && (
              <p className="mt-1 text-sm text-gray-500">
                Minimaal 6 karakters aanbevolen
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="role"
                className="block text-lg font-semibold text-gray-900 mb-2"
              >
                Rol
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="member">Lid</option>
                <option value="admin">Beheerder</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="paymentStatus"
                className="block text-lg font-semibold text-gray-900 mb-2"
              >
                Betaalstatus
              </label>
              <select
                id="paymentStatus"
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="unpaid">Onbetaald</option>
                <option value="paid">Betaald</option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="paymentYear"
              className="block text-lg font-semibold text-gray-900 mb-2"
            >
              Betaaljaar
            </label>
            <input
              type="number"
              id="paymentYear"
              value={paymentYear}
              onChange={(e) => setPaymentYear(parseInt(e.target.value))}
              min="2020"
              max="2050"
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-4 bg-gray-200 text-gray-900 text-xl font-semibold rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Annuleren
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-4 bg-blue-600 text-white text-xl font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Bezig...' : member ? 'Opslaan' : 'Toevoegen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
