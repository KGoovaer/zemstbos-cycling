'use client'

import { useEffect, useState, useCallback } from 'react'
import { PaymentTable } from '@/components/admin/PaymentTable'

interface Season {
  id: string
  year: number
  startDate: string
  endDate: string
  isActive: boolean
}

interface SeasonPayment {
  id: string
  seasonId: string
  paidAt: string
  season: {
    id: string
    year: number
  }
}

interface Member {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string | null
  role: string
  paymentStatus: string
  paymentYear: number | null
  paidSeasonId: string | null
  paidSeason?: Season | null
  seasonPayments: SeasonPayment[]
  isActive: boolean
  createdAt: string
}

export default function PaymentTrackingPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([])
  const [seasons, setSeasons] = useState<Season[]>([])
  const [selectedSeason, setSelectedSeason] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [paymentFilter, setPaymentFilter] = useState<string>('all')
  const [exporting, setExporting] = useState(false)
  const [bulkSelecting, setBulkSelecting] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchSeasons()
    fetchMembers()
  }, [])

  useEffect(() => {
    filterMembers()
  }, [members, searchTerm, paymentFilter, selectedSeason])

  const fetchSeasons = async () => {
    try {
      const response = await fetch('/api/admin/seasons')
      if (response.ok) {
        const data = await response.json()
        setSeasons(data)
        const activeSeason = data.find((s: Season) => s.isActive)
        if (activeSeason) {
          setSelectedSeason(activeSeason.id)
        } else if (data.length > 0) {
          setSelectedSeason(data[0].id)
        }
      }
    } catch (error) {
      console.error('Error fetching seasons:', error)
    }
  }

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
    let filtered = members.filter((m) => m.isActive)

    // Filter by season payment status
    if (selectedSeason && paymentFilter !== 'all') {
      if (paymentFilter === 'paid') {
        filtered = filtered.filter((m) =>
          m.seasonPayments.some((p) => p.seasonId === selectedSeason)
        )
      } else if (paymentFilter === 'unpaid') {
        filtered = filtered.filter(
          (m) =>
            !m.seasonPayments.some((p) => p.seasonId === selectedSeason) &&
            m.paymentStatus !== 'exempt'
        )
      } else if (paymentFilter === 'exempt') {
        filtered = filtered.filter((m) => m.paymentStatus === 'exempt')
      }
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (m) =>
          m.email.toLowerCase().includes(term) ||
          m.firstName.toLowerCase().includes(term) ||
          m.lastName.toLowerCase().includes(term)
      )
    }

    setFilteredMembers(filtered)
  }, [members, searchTerm, paymentFilter, selectedSeason])

  const handleUpdatePayment = async (
    id: string,
    action: string,
    seasonId: string | null
  ) => {
    try {
      const response = await fetch(`/api/admin/members/${id}/payment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          seasonId,
        }),
      })

      if (response.ok) {
        await fetchMembers()
      } else {
        alert('Fout bij bijwerken van betaalstatus')
      }
    } catch (error) {
      console.error('Error updating payment:', error)
      alert('Fout bij bijwerken van betaalstatus')
    }
  }

  const handleBulkUpdate = async (status: string) => {
    if (selectedIds.size === 0) {
      alert('Selecteer eerst leden om bij te werken')
      return
    }

    if (!selectedSeason && status === 'paid') {
      alert('Selecteer eerst een seizoen')
      return
    }

    const seasonYear = seasons.find((s) => s.id === selectedSeason)?.year
    const statusLabel =
      status === 'paid'
        ? `betaald voor seizoen ${seasonYear}`
        : status === 'exempt'
        ? 'vrijgesteld'
        : 'onbetaald'

    if (
      !confirm(
        `Weet je zeker dat je ${selectedIds.size} lid(leden) wilt markeren als ${statusLabel}?`
      )
    ) {
      return
    }

    try {
      const promises = Array.from(selectedIds).map((id) =>
        fetch(`/api/admin/members/${id}/payment`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: status,
            seasonId: selectedSeason,
          }),
        })
      )

      await Promise.all(promises)
      await fetchMembers()
      setSelectedIds(new Set())
      setBulkSelecting(false)
    } catch (error) {
      console.error('Error bulk updating payments:', error)
      alert('Fout bij bulk update')
    }
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
        a.download = `betalingen-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        alert('Fout bij exporteren van betalingen')
      }
    } catch (error) {
      console.error('Error exporting:', error)
      alert('Fout bij exporteren van betalingen')
    } finally {
      setExporting(false)
    }
  }

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const selectAll = () => {
    if (selectedIds.size === filteredMembers.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredMembers.map((m) => m.id)))
    }
  }

  const getStats = () => {
    const activeMembers = members.filter((m) => m.isActive)
    const paid = activeMembers.filter((m) =>
      m.seasonPayments.some((p) => p.seasonId === selectedSeason)
    ).length
    const unpaid = activeMembers.filter(
      (m) =>
        !m.seasonPayments.some((p) => p.seasonId === selectedSeason) &&
        m.paymentStatus !== 'exempt'
    ).length
    const exempt = activeMembers.filter(
      (m) => m.paymentStatus === 'exempt'
    ).length
    const total = activeMembers.length
    const paidPercentage = total > 0 ? Math.round((paid / total) * 100) : 0

    return { paid, unpaid, exempt, total, paidPercentage }
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
              Betaalstatus Beheer
            </h1>
            <p className="text-xl text-gray-600">
              Volg de betaalstatus van alle clubleden
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
              onClick={() => setBulkSelecting(!bulkSelecting)}
              className={`px-6 py-3 text-lg font-semibold rounded-lg transition-colors ${
                bulkSelecting
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {bulkSelecting ? '✗ Annuleren' : '☑ Bulk Update'}
            </button>
          </div>
        </div>

        {/* Season Selector */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
          <label
            htmlFor="season"
            className="block text-lg font-semibold text-gray-900 mb-2"
          >
            Seizoen
          </label>
          <select
            id="season"
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="w-full md:w-auto px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Selecteer seizoen</option>
            {seasons.map((season) => (
              <option key={season.id} value={season.id}>
                Seizoen {season.year}
                {season.isActive ? ' (Actief)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg text-gray-600 mb-1">Totaal Actief</p>
                <p className="text-4xl font-bold text-gray-900">
                  {stats.total}
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
                <p className="text-sm text-gray-500 mt-1">
                  {stats.paidPercentage}%
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

          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg text-gray-600 mb-1">Vrijgesteld</p>
                <p className="text-4xl font-bold text-gray-600">
                  {stats.exempt}
                </p>
              </div>
              <div className="text-5xl">◉</div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {bulkSelecting && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Bulk Acties ({selectedIds.size} geselecteerd)
            </h3>
            <div className="flex gap-3">
              <button
                onClick={selectAll}
                className="px-6 py-3 bg-gray-600 text-white text-lg font-semibold rounded-lg hover:bg-gray-700 transition-colors"
              >
                {selectedIds.size === filteredMembers.length
                  ? 'Deselecteer Alles'
                  : 'Selecteer Alles'}
              </button>
              <button
                onClick={() => handleBulkUpdate('paid')}
                disabled={selectedIds.size === 0}
                className="px-6 py-3 bg-green-600 text-white text-lg font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                ✓ Markeer Betaald
              </button>
              <button
                onClick={() => handleBulkUpdate('unpaid')}
                disabled={selectedIds.size === 0}
                className="px-6 py-3 bg-red-600 text-white text-lg font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                ✗ Markeer Onbetaald
              </button>
              <button
                onClick={() => handleBulkUpdate('exempt')}
                disabled={selectedIds.size === 0}
                className="px-6 py-3 bg-gray-600 text-white text-lg font-semibold rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                ◉ Vrijstellen
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                placeholder="Naam of email..."
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="paymentFilter"
                className="block text-lg font-semibold text-gray-900 mb-2"
              >
                Betaalstatus Filter
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
                <option value="exempt">Vrijgesteld</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payment Table */}
        {bulkSelecting ? (
          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={
                          selectedIds.size === filteredMembers.length &&
                          filteredMembers.length > 0
                        }
                        onChange={selectAll}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-base font-semibold text-gray-900">
                      Naam
                    </th>
                    <th className="px-6 py-4 text-left text-base font-semibold text-gray-900">
                      Email
                    </th>
                    <th className="px-6 py-4 text-center text-base font-semibold text-gray-900">
                      Status
                    </th>
                    <th className="px-6 py-4 text-center text-base font-semibold text-gray-900">
                      Jaar
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredMembers.map((member) => (
                    <tr
                      key={member.id}
                      className={`hover:bg-gray-50 ${
                        selectedIds.has(member.id) ? 'bg-blue-50' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(member.id)}
                          onChange={() => toggleSelection(member.id)}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-lg font-medium text-gray-900">
                          {member.firstName} {member.lastName}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-base text-gray-700">
                          {member.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            member.paymentStatus === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : member.paymentStatus === 'exempt'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {member.paymentStatus === 'paid'
                            ? 'Betaald'
                            : member.paymentStatus === 'exempt'
                            ? 'Vrijgesteld'
                            : 'Onbetaald'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-base text-gray-700">
                        {member.paymentYear || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <PaymentTable
            members={filteredMembers}
            seasons={seasons}
            selectedSeason={selectedSeason}
            onUpdatePayment={handleUpdatePayment}
          />
        )}
      </div>
    </div>
  )
}
