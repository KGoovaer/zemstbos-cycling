export function ContactInfo() {
  return (
    <div className="card p-8">
      <h2 className="text-3xl font-bold mb-8 text-slate-900">Contactgegevens</h2>

      <div className="space-y-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-xl text-slate-900">Email</h3>
          </div>
          <a
            href="mailto:info@zemstbos.be"
            className="text-emerald-600 hover:text-emerald-700 text-xl font-medium transition-colors ml-15"
          >
            info@zemstbos.be
          </a>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-xl text-slate-900">Verzamelplaats</h3>
          </div>
          <address className="not-italic text-slate-700 text-lg ml-15 leading-relaxed">
            Zemst Centrum<br />
            Parking Gemeentehuis<br />
            Zemst, België
          </address>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-xl text-slate-900">Starttijd</h3>
          </div>
          <p className="text-slate-700 text-lg ml-15">
            <span className="font-semibold">Zondagen om 09:00 uur</span><br />
            <span className="text-slate-600">Maart tot Oktober</span>
          </p>
        </div>

        <div className="bg-emerald-50 rounded-lg p-6 mt-8">
          <p className="text-slate-700 text-lg leading-relaxed">
            <span className="font-semibold text-emerald-700">💡 Tip:</span> Kom een keer vrijblijvend meefietsen 
            om de club te leren kennen!
          </p>
        </div>
      </div>
    </div>
  )
}
