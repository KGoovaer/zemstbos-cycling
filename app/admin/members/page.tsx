'use client'

import { useEffect, useState, useCallback } from 'react'
import { MemberTable } from '@/components/admin/MemberTable'
import { MemberForm } from '@/components/admin/MemberForm'

interface Member {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string | null
  address: string | null
  birthDate: string | null
  role: string
  paymentStatus: string
  paymentYear: number | null
  isActive: boolean
  createdAt: string
}

export default function MembersManagementPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('active')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    fetchMembers()
  }, [])

  useEffect(() => {
    filterMembers()
  }, [members, searchTerm, statusFilter, paymentFilter])

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/admin/members')
      if (response.ok) {
        const data = await response.json()
        setMembers(data)
      }
    } catch (error) {
      console.error('Error fetching members:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterMembers = useCallback(() => {
    let filtered = members

    // Status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter((m) => m.isActive)
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter((m) => !m.isActive)
    }

    // Payment filter
    if (paymentFilter !== 'all') {
      filtered = filtered.filter((m) => m.paymentStatus === paymentFilter)
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (m) =>
          m.email.toLowerCase().includes(term) ||
          m.firstName.toLowerCase().includes(term) ||
          m.lastName.toLowerCase().includes(term) ||
          (m.phone && m.phone.toLowerCase().includes(term))
      )
    }

    setFilteredMembers(filtered)
  }, [members, searchTerm, statusFilter, paymentFilter])

  const handleDeactivate = async (id: string) => {
    const member = members.find((m) => m.id === id)
    if (
      !confirm(
        `Weet je zeker dat je ${member?.firstName} ${member?.lastName} wilt deactiveren?`
      )
    ) {
      return
    }

    try {
      const response = await fetch(`/api/admin/members/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchMembers()
      } else {
        alert('Fout bij deactiveren van lid')
      }
    } catch (error) {
      console.error('Error deactivating member:', error)
      alert('Fout bij deactiveren van lid')
    }
  }

  const handleEdit = (member: Member) => {
    setEditingMember(member)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingMember(null)
  }

  const handleFormSuccess = async () => {
    await fetchMembers()
    handleFormClose()
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const response = await fetch('/api/admin/members/export')
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `leden-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        alert('Fout bij exporteren van leden')
      }
    } catch (error) {
      console.error('Error exporting members:', error)
      alert('Fout bij exporteren van leden')
    } finally {
      setExporting(false)
    }
  }

  const getStats = () => {
    const active = members.filter((m) => m.isActive).length
    const paid = members.filter(
      (m) => m.isActive && m.paymentStatus === 'paid'
    ).length
    const unpaid = members.filter(
      (m) => m.isActive && m.paymentStatus === 'unpaid'
    ).length

    return { active, paid, unpaid }
  }

  const stats = getStats()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-xl text-gray-600">Laden...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Leden Beheer
            </h1>
            <p className="text-xl text-gray-600">
              Beheer clubleden en hun betaalstatus
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              disabled={exporting}
              className="px-6 py-3 bg-gray-600 text-white text-lg font-semibold rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              {exporting ? 'Bezig...' : '📥 Exporteren'}
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-green-600 text-white text-lg font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              + Nieuw Lid
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg text-gray-600 mb-1">Actieve Leden</p>
                <p className="text-4xl font-bold text-gray-900">
                  {stats.active}
                </p>
              </div>
              <div className="text-5xl">👥</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg text-gray-600 mb-1">Betaald</p>
                <p className="text-4xl font-bold text-green-600">
                  {stats.paid}
                </p>
              </div>
              <div className="text-5xl">✓</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg text-gray-600 mb-1">Onbetaald</p>
                <p className="text-4xl font-bold text-red-600">
                  {stats.unpaid}
                </p>
              </div>
              <div className="text-5xl">⚠</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="search"
                className="block text-lg font-semibold text-gray-900 mb-2"
              >
                Zoeken
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Naam, email of telefoon..."
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="statusFilter"
                className="block text-lg font-semibold text-gray-900 mb-2"
              >
                Status
              </label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Alle</option>
                <option value="active">Actief</option>
                <option value="inactive">Inactief</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="paymentFilter"
                className="block text-lg font-semibold text-gray-900 mb-2"
              >
                Betaling
              </label>
              <select
                id="paymentFilter"
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Alle</option>
                <option value="paid">Betaald</option>
                <option value="unpaid">Onbetaald</option>
              </select>
            </div>
          </div>
        </div>

        <MemberTable
          members={filteredMembers}
          onEdit={handleEdit}
          onDeactivate={handleDeactivate}
        />
      </div>

      {showForm && (
        <MemberForm
          member={editingMember}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  )
}
