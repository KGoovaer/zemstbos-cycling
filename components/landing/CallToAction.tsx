import Link from 'next/link'

export function CallToAction() {
  return (
    <section className="py-16 bg-blue-600 text-white">
      <div className="container mx-auto px-4 text-center max-w-4xl">
        <h2 className="text-4xl font-bold mb-6">
          Klaar om mee te rijden?
        </h2>
        <p className="text-2xl mb-10">
          Word lid en ontdek samen met ons de mooiste routes van Vlaanderen
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
            className="bg-blue-700 text-white px-8 py-4 text-xl font-semibold rounded-lg hover:bg-blue-800 min-h-touch min-w-[200px] inline-flex items-center justify-center border-2 border-white"
          >
            Meer Informatie
          </Link>
        </div>
      </div>
    </section>
  )
}
