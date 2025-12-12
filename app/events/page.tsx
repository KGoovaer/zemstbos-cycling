import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function EventsPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Clubevenementen</h1>
        <p className="text-lg text-gray-600 mb-8">
          Bekijk alle clubactiviteiten en evenementen.
        </p>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center py-12">
            <svg
              className="mx-auto h-24 w-24 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="mt-4 text-xl font-medium text-gray-900">
              Evenementen komen binnenkort
            </h3>
            <p className="mt-2 text-base text-gray-500">
              Hier komen clubactiviteiten zoals het seizoensopener, social events en afsluitende activiteiten te staan.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
