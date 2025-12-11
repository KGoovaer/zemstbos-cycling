import Link from 'next/link'

export const metadata = {
  title: 'Aanmelden - Zemst BOS Cycling Club',
  description: 'Meld je aan bij Zemst BOS Cycling Club',
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-6">Aanmelden</h1>
        <p className="text-xl text-center mb-8 text-gray-600">
          De login functionaliteit wordt binnenkort geïmplementeerd.
        </p>
        <Link
          href="/"
          className="block text-center bg-blue-600 text-white px-6 py-3 text-lg font-semibold rounded-lg hover:bg-blue-700"
        >
          Terug naar Home
        </Link>
      </div>
    </main>
  )
}
