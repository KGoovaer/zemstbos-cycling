import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function CalendarPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Seizoenskalender</h1>
        <p className="text-lg text-gray-600 mb-8">
          Bekijk alle geplande ritten voor dit seizoen.
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h3 className="mt-4 text-xl font-medium text-gray-900">
              Kalender komt binnenkort
            </h3>
            <p className="mt-2 text-base text-gray-500">
              Hier komt de seizoenskalender met alle geplande ritten te staan.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
