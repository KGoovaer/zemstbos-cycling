'use client'

interface Member {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string | null
  role: string
  paymentStatus: string
  paymentYear: number | null
  isActive: boolean
  createdAt: string
}

interface Props {
  members: Member[]
  onEdit: (member: Member) => void
  onDeactivate: (id: string) => void
}

export function MemberTable({ members, onEdit, onDeactivate }: Props) {
  const getPaymentStatusBadge = (status: string) => {
    if (status === 'paid') {
      return (
        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold border border-green-200">
          Betaald
        </span>
      )
    }
    return (
      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold border border-red-200">
        Onbetaald
      </span>
    )
  }

  const getRoleBadge = (role: string) => {
    if (role === 'admin') {
      return (
        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold border border-purple-200">
          Beheerder
        </span>
      )
    }
    return (
      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold border border-blue-200">
        Lid
      </span>
    )
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
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Naam
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Email
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Telefoon
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Rol
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Betaling
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Status
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
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
                  <div className="text-base font-medium text-gray-900">
                    {member.firstName} {member.lastName}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-base text-gray-700">{member.email}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-base text-gray-700">
                    {member.phone || '-'}
                  </div>
                </td>
                <td className="px-6 py-4">{getRoleBadge(member.role)}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    {getPaymentStatusBadge(member.paymentStatus)}
                    {member.paymentYear && (
                      <span className="text-sm text-gray-500">
                        {member.paymentYear}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {member.isActive ? (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold border border-green-200">
                      Actief
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-semibold border border-gray-200">
                      Inactief
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => onEdit(member)}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded hover:bg-blue-700 transition-colors"
                    >
                      Bewerken
                    </button>
                    {member.isActive && (
                      <button
                        onClick={() => onDeactivate(member.id)}
                        className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded hover:bg-red-700 transition-colors"
                      >
                        Deactiveren
                      </button>
                    )}
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
