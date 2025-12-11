import Link from 'next/link'

export const metadata = {
  title: 'Contact - Zemst BOS Cycling Club',
  description: 'Neem contact op met Zemst BOS Cycling Club',
}

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-center mb-8">Contact</h1>
          
          <div className="space-y-6 text-lg">
            <div>
              <h2 className="text-2xl font-semibold mb-3">Neem Contact Op</h2>
              <p className="text-gray-700 leading-relaxed">
                Heb je vragen over de club, lidmaatschap of onze ritten? 
                We horen graag van je!
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Email</h3>
              <p className="text-gray-700">
                <a href="mailto:info@zemstbos.be" className="text-blue-600 hover:underline">
                  info@zemstbos.be
                </a>
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Startlocatie</h3>
              <p className="text-gray-700">
                Alle ritten vertrekken om 9:00 uur vanuit Zemst centrum.
              </p>
            </div>

            <div className="pt-6">
              <Link
                href="/"
                className="inline-block bg-blue-600 text-white px-8 py-4 text-xl font-semibold rounded-lg hover:bg-blue-700 min-h-touch min-w-[200px] text-center"
              >
                Terug naar Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
