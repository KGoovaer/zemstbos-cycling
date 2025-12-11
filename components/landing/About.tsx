export function About() {
  return (
    <section className="py-20 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
              Over Onze Club
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Passie voor fietsen, plezier in groepsverband, en de mooiste routes van Vlaanderen
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Card 1 */}
            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900">Gezellige Groep</h3>
              <p className="text-lg text-slate-600 leading-relaxed">
                Een hechte gemeenschap van fietsliefhebbers die samen genieten van elke rit
              </p>
            </div>

            {/* Card 2 */}
            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900">Mooie Routes</h3>
              <p className="text-lg text-slate-600 leading-relaxed">
                60-100 km routes door de mooiste landschappen van Vlaanderen
              </p>
            </div>

            {/* Card 3 */}
            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900">Vaste Planning</h3>
              <p className="text-lg text-slate-600 leading-relaxed">
                Elke zondag om 9:00 uur, van maart tot oktober
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl shadow-lg p-10 max-w-4xl mx-auto">
            <div className="text-lg text-slate-700 leading-relaxed space-y-4">
              <p>
                Welkom bij Zemst BOS Cycling Club! We zijn een vriendelijke wielrijvereniging 
                die al jarenlang elke zondag de baan op gaat voor sportieve en gezellige ritten.
              </p>
              <p>
                Of je nu een ervaren wielrenner bent of gewoon graag buiten fietst, 
                bij ons vind je gelijkgestemde sportievelingen. We rijden in een comfortabel 
                tempo en stoppen onderweg altijd voor een gezellige koffiepauze.
              </p>
              <p className="font-semibold text-emerald-600">
                Iedereen is welkom om een kennismakingsrit mee te rijden!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
