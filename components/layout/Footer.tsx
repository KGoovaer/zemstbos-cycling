import Link from 'next/link'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-slate-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">Zemst BOS Cycling</h3>
            <p className="text-slate-300 text-lg leading-relaxed">
              Wielrijvereniging voor zondagritten van maart tot oktober.
              Samen genieten van de mooiste routes in Vlaanderen.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-4">Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-slate-300 hover:text-emerald-400 text-lg transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-slate-300 hover:text-emerald-400 text-lg transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-slate-300 hover:text-emerald-400 text-lg transition-colors"
                >
                  Login
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-4">Contact</h3>
            <ul className="space-y-2 text-slate-300 text-lg">
              <li>
                <a
                  href="mailto:info@zemstbos.be"
                  className="hover:text-emerald-400 transition-colors"
                >
                  info@zemstbos.be
                </a>
              </li>
              <li>Startlocatie: Zemst centrum</li>
              <li>Zondagen om 9:00 uur</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
          <p className="text-lg">
            © {currentYear} Zemst BOS Cycling Club. Alle rechten voorbehouden.
          </p>
        </div>
      </div>
    </footer>
  )
}
