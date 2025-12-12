import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Mijn Profiel</h1>
        <p className="text-lg text-gray-600 mb-8">
          Bekijk en beheer je persoonlijke gegevens.
        </p>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Naam
              </label>
              <p className="text-lg text-gray-900">{session.user.name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <p className="text-lg text-gray-900">{session.user.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rol
              </label>
              <p className="text-lg text-gray-900 capitalize">{session.user.role}</p>
            </div>

            <div className="pt-6">
              <div className="text-center py-8">
                <svg
                  className="mx-auto h-16 w-16 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <p className="mt-4 text-base text-gray-500">
                  Meer profielinformatie en bewerkmogelijkheden komen binnenkort.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
