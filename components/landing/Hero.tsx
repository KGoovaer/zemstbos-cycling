import Link from 'next/link'

export function Hero() {
  return (
    <section className="bg-gradient-to-b from-blue-600 to-blue-800 text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Welkom bij Zemst BOS Cycling Club
        </h1>
        <p className="text-2xl md:text-3xl mb-8 max-w-3xl mx-auto">
          Zondag fietsritten van maart tot oktober
        </p>
        <p className="text-xl mb-12 max-w-2xl mx-auto">
          Sluit je aan bij onze groep fietsliefhebbers voor prachtige ritten door Vlaanderen
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/login"
            className="bg-white text-blue-600 px-8 py-4 text-xl font-semibold rounded-lg hover:bg-gray-100 min-h-touch min-w-[200px] inline-flex items-center justify-center"
          >
            Aanmelden
          </Link>
          <Link
            href="/contact"
            className="bg-blue-700 text-white px-8 py-4 text-xl font-semibold rounded-lg hover:bg-blue-900 min-h-touch min-w-[200px] inline-flex items-center justify-center border-2 border-white"
          >
            Contact
          </Link>
        </div>
      </div>
    </section>
  )
}
