import Link from 'next/link'

export function CallToAction() {
  return (
    <section className="py-20 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="container mx-auto px-4 text-center max-w-4xl relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Klaar om mee te rijden?
        </h2>
        <p className="text-2xl md:text-3xl mb-12 text-emerald-50">
          Word lid en ontdek samen met ons de mooiste routes van Vlaanderen
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/login"
            className="bg-white text-emerald-600 px-8 py-4 text-xl font-semibold rounded-lg hover:bg-emerald-50 transition-all duration-200 min-h-touch min-w-[200px] inline-flex items-center justify-center shadow-xl hover:shadow-2xl hover:scale-105"
          >
            Word lid →
          </Link>
          <Link
            href="/contact"
            className="btn-outline"
          >
            Neem contact op
          </Link>
        </div>
      </div>
    </section>
  )
}
