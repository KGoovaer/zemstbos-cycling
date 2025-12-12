import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center space-y-4 p-8">
        <h1 className="text-4xl font-bold text-gray-900">403</h1>
        <h2 className="text-2xl font-semibold text-gray-700">
          Geen toegang
        </h2>
        <p className="text-lg text-gray-600">
          Je hebt geen toestemming om deze pagina te bekijken.
        </p>
        <p className="text-base text-gray-500">
          Deze pagina is alleen toegankelijk voor beheerders.
        </p>
        <Link
          href="/"
          className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white text-lg rounded-lg hover:bg-blue-700 min-h-touch"
        >
          Terug naar home
        </Link>
      </div>
    </div>
  )
}
