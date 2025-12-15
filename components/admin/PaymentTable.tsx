'use client'

interface Season {
  id: string
  year: number
  startDate: string
  endDate: string
  isActive: boolean
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
  isActive: boolean
  createdAt: string
}

interface Props {
  members: Member[]
  seasons: Season[]
  selectedSeason: string
  onUpdatePayment: (id: string, status: string, seasonId: string | null) => void
}

export function PaymentTable({ members, seasons, selectedSeason, onUpdatePayment }: Props) {
  const handleTogglePayment = (member: Member) => {
    const isPaidForSeason = member.paidSeasonId === selectedSeason
    const newStatus = isPaidForSeason ? 'unpaid' : 'paid'
    const newSeasonId = isPaidForSeason ? null : selectedSeason
    onUpdatePayment(member.id, newStatus, newSeasonId)
  }

  if (members.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-8 text-center">
        <p className="text-xl text-gray-600">Geen leden gevonden</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-base font-semibold text-gray-900">
                Naam
              </th>
              <th className="px-6 py-4 text-left text-base font-semibold text-gray-900">
                Email
              </th>
              <th className="px-6 py-4 text-left text-base font-semibold text-gray-900">
                Telefoon
              </th>
              <th className="px-6 py-4 text-center text-base font-semibold text-gray-900">
                Betaalstatus
              </th>
              <th className="px-6 py-4 text-center text-base font-semibold text-gray-900">
                Betaald Seizoen
              </th>
              <th className="px-6 py-4 text-center text-base font-semibold text-gray-900">
                Acties
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {members.map((member) => (
              <tr
                key={member.id}
                className={`hover:bg-gray-50 ${
                  !member.isActive ? 'opacity-50' : ''
                }`}
              >
                <td className="px-6 py-4">
                  <div className="text-lg font-medium text-gray-900">
                    {member.firstName} {member.lastName}
                  </div>
                  {!member.isActive && (
                    <span className="text-sm text-gray-500">(Inactief)</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-base text-gray-700">{member.email}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-base text-gray-700">
                    {member.phone || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  {member.paidSeasonId === selectedSeason ? (
                    <span className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-base font-semibold border-2 border-green-200">
                      ✓ Betaald
                    </span>
                  ) : member.paymentStatus === 'exempt' ? (
                    <span className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-800 rounded-full text-base font-semibold border-2 border-gray-200">
                      ◉ Vrijgesteld
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-4 py-2 bg-red-100 text-red-800 rounded-full text-base font-semibold border-2 border-red-200">
                      ✗ Onbetaald
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  {member.paidSeasonId ? (
                    <span className="px-3 py-1 bg-blue-50 text-blue-800 rounded-full text-base font-medium border border-blue-200">
                      Seizoen {seasons.find(s => s.id === member.paidSeasonId)?.year || '?'}
                    </span>
                  ) : (
                    <span className="text-gray-500 text-base">-</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleTogglePayment(member)}
                      disabled={!member.isActive || !selectedSeason || member.paymentStatus === 'exempt'}
                      className={`
                        px-6 py-3 text-base font-semibold rounded-lg transition-colors min-w-[140px]
                        ${
                          member.paidSeasonId === selectedSeason
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }
                        disabled:opacity-50 disabled:cursor-not-allowed
                      `}
                    >
                      {member.paidSeasonId === selectedSeason
                        ? '✗ Onbetaald'
                        : '✓ Betaald'}
                    </button>
                    <button
                      onClick={() =>
                        onUpdatePayment(
                          member.id,
                          member.paymentStatus === 'exempt' ? 'unpaid' : 'exempt',
                          null
                        )
                      }
                      disabled={!member.isActive}
                      className={`
                        px-6 py-3 text-base font-semibold rounded-lg transition-colors min-w-[140px]
                        ${
                          member.paymentStatus === 'exempt'
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-gray-600 hover:bg-gray-700 text-white'
                        }
                        disabled:opacity-50 disabled:cursor-not-allowed
                      `}
                    >
                      {member.paymentStatus === 'exempt'
                        ? 'Verwijder vrijstelling'
                        : 'Vrijstellen'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
