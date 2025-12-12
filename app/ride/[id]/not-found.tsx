import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-gray-800 mb-4">Rit niet gevonden</h2>
        <p className="text-xl text-gray-600 mb-8">
          De gevraagde rit bestaat niet of is niet meer beschikbaar.
        </p>
        <Link
          href="/calendar"
          className="inline-block px-8 py-4 bg-blue-600 text-white text-xl font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Terug naar kalender
        </Link>
      </div>
    </div>
  )
}
