'use client'

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

interface Props {
  members: Member[]
  seasons: Season[]
  selectedSeason: string
  onUpdatePayment: (id: string, action: string, seasonId: string | null) => void
}

export function PaymentTable({ members, selectedSeason, onUpdatePayment }: Props) {
  const hasPaidForSeason = (member: Member, seasonId: string) => {
    return member.seasonPayments.some((p) => p.seasonId === seasonId)
  }

  const handleTogglePayment = (member: Member) => {
    const isPaid = hasPaidForSeason(member, selectedSeason)
    const action = isPaid ? 'unpaid' : 'paid'
    onUpdatePayment(member.id, action, selectedSeason)
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
                  {hasPaidForSeason(member, selectedSeason) ? (
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
                  {member.seasonPayments.length > 0 ? (
                    <div className="flex flex-wrap gap-1 justify-center">
                      {member.seasonPayments
                        .sort((a, b) => b.season.year - a.season.year)
                        .map((payment) => (
                          <span
                            key={payment.id}
                            className={`px-2 py-1 rounded-full text-sm font-medium border ${
                              payment.seasonId === selectedSeason
                                ? 'bg-green-50 text-green-800 border-green-200'
                                : 'bg-blue-50 text-blue-800 border-blue-200'
                            }`}
                          >
                            {payment.season.year}
                          </span>
                        ))}
                    </div>
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
                          hasPaidForSeason(member, selectedSeason)
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }
                        disabled:opacity-50 disabled:cursor-not-allowed
                      `}
                    >
                      {hasPaidForSeason(member, selectedSeason)
                        ? '✗ Onbetaald'
                        : '✓ Betaald'}
                    </button>
                    <button
                      onClick={() =>
                        onUpdatePayment(
                          member.id,
                          member.paymentStatus === 'exempt' ? 'unexempt' : 'exempt',
                          selectedSeason
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
