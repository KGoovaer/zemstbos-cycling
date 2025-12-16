'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Route {
  id: string
  name: string
  description: string | null
  distanceKm: number
  elevationM: number | null
  difficulty: string | null
  startLocation: string | null
  region: string | null
  timesRidden: number
  lastRidden: Date | null
  createdAt: Date
  _count: {
    scheduledRides: number
  }
}

interface RouteTableProps {
  routes: Route[]
  onDelete: (id: string) => void
}

export function RouteTable({ routes, onDelete }: RouteTableProps) {
  const [sortBy, setSortBy] = useState<'name' | 'distance' | 'lastRidden' | 'timesRidden'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }

  const sortedRoutes = [...routes].sort((a, b) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let aVal: any, bVal: any

    switch (sortBy) {
      case 'name':
        aVal = a.name.toLowerCase()
        bVal = b.name.toLowerCase()
        break
      case 'distance':
        aVal = Number(a.distanceKm)
        bVal = Number(b.distanceKm)
        break
      case 'lastRidden':
        aVal = a.lastRidden ? new Date(a.lastRidden).getTime() : 0
        bVal = b.lastRidden ? new Date(b.lastRidden).getTime() : 0
        break
      case 'timesRidden':
        aVal = a.timesRidden
        bVal = b.timesRidden
        break
    }

    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })

  const SortIcon = ({ column }: { column: typeof sortBy }) => {
    if (sortBy !== column) return null
    return (
      <span className="ml-1">
        {sortOrder === 'asc' ? '↑' : '↓'}
      </span>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-slate-200 rounded-lg">
        <thead className="bg-slate-50">
          <tr>
            <th
              className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-slate-100"
              onClick={() => handleSort('name')}
            >
              Route Naam <SortIcon column="name" />
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
              Regio
            </th>
            <th
              className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-slate-100"
              onClick={() => handleSort('distance')}
            >
              Afstand <SortIcon column="distance" />
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
              Moeilijkheid
            </th>
            <th
              className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-slate-100"
              onClick={() => handleSort('timesRidden')}
            >
              Keren Gereden <SortIcon column="timesRidden" />
            </th>
            <th
              className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-slate-100"
              onClick={() => handleSort('lastRidden')}
            >
              Laatst Gereden <SortIcon column="lastRidden" />
            </th>
            <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
              Acties
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sortedRoutes.map((route) => (
            <tr key={route.id} className="hover:bg-slate-50">
              <td className="px-6 py-4">
                <div className="text-base font-semibold text-gray-900">
                  {route.name}
                </div>
                {route.startLocation && (
                  <div className="text-sm text-slate-800">
                    Start: {route.startLocation}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 text-base text-gray-900">
                {route.region || '-'}
              </td>
              <td className="px-6 py-4 text-base text-gray-900">
                {Number(route.distanceKm).toFixed(1)} km
                {route.elevationM && (
                  <div className="text-sm text-slate-800">
                    {route.elevationM}m hoogte
                  </div>
                )}
              </td>
              <td className="px-6 py-4">
                {route.difficulty ? (
                  <span
                    className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                      route.difficulty === 'easy'
                        ? 'bg-green-100 text-green-800'
                        : route.difficulty === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {route.difficulty === 'easy'
                      ? 'Makkelijk'
                      : route.difficulty === 'medium'
                      ? 'Gemiddeld'
                      : 'Moeilijk'}
                  </span>
                ) : (
                  <span className="text-slate-600">-</span>
                )}
              </td>
              <td className="px-6 py-4 text-base text-gray-900 text-center">
                {route.timesRidden}
              </td>
              <td className="px-6 py-4 text-base text-gray-900">
                {route.lastRidden
                  ? new Date(route.lastRidden).toLocaleDateString('nl-BE', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'Nooit'}
              </td>
              <td className="px-6 py-4 text-right space-x-3">
                <Link
                  href={`/admin/routes/${route.id}/edit`}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700"
                >
                  Bewerken
                </Link>
                <button
                  onClick={() => {
                    if (route._count.scheduledRides > 0) {
                      alert(
                        `Deze route is gepland voor ${route._count.scheduledRides} toekomstige rit(ten). Verwijder eerst deze ritten.`
                      )
                      return
                    }
                    if (
                      confirm(
                        `Weet je zeker dat je "${route.name}" wilt verwijderen? Deze actie kan niet ongedaan worden.`
                      )
                    ) {
                      onDelete(route.id)
                    }
                  }}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700"
                >
                  Verwijderen
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {sortedRoutes.length === 0 && (
        <div className="text-center py-12 text-slate-700 text-lg">
          Geen routes gevonden
        </div>
      )}
    </div>
  )
}
