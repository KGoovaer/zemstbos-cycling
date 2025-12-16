import Link from 'next/link'

export function Hero() {
  return (
    <section className="relative min-h-[600px] md:min-h-[700px] flex items-center bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMSI+PHBhdGggZD0iTTM2IDE0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDQwYzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00ek0xNCAyNmMtMi4yMSAwLTQtMS43OS00LTRzMS43OS00IDQtNCA0IDEuNzkgNCA0LTEuNzkgNC00IDR6bTAgNDBjLTIuMjEgMC00LTEuNzktNC00czEuNzktNCA0LTQgNCAxLjc5IDQgNC0xLjc5IDQtNCA0eiIvPjwvZz48L2c+PC9zdmc+')] bg-repeat"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl">
          <div className="inline-block mb-6">
            <span className="bg-white/20 backdrop-blur-sm text-white px-6 py-2 rounded-full text-lg font-semibold">
              🚴 Wielrijvereniging
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white leading-tight">
            Rijd mee met<br />
            <span className="text-emerald-200">Zemst BOS Cycling</span>
          </h1>
          
          <p className="text-2xl md:text-3xl mb-8 text-emerald-50 max-w-2xl">
            Zondag fietsritten van maart tot oktober
          </p>
          
          <p className="text-xl md:text-2xl mb-12 text-white/90 max-w-2xl leading-relaxed">
            Ontdek de mooiste routes door Vlaanderen samen met onze gepassioneerde fietsgroep
          </p>
          
          <div className="flex gap-4 flex-wrap">
            <Link
              href="/login"
              className="btn-primary"
            >
              Word lid en rijd mee
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative element */}
      <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-gradient-to-tl from-white/10 to-transparent rounded-tl-full"></div>
    </section>
  )
}
