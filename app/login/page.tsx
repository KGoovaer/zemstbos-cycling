import Link from 'next/link'

export const metadata = {
  title: 'Aanmelden - Zemst BOS Cycling Club',
  description: 'Meld je aan bij Zemst BOS Cycling Club',
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-slate-50">
      <div className="max-w-md w-full">
        <div className="card p-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">Z</span>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Aanmelden</h1>
            <p className="text-lg text-slate-600">
              Toegang voor leden
            </p>
          </div>
          
          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-6 mb-8">
            <p className="text-lg text-center text-slate-700 leading-relaxed">
              🔒 De login functionaliteit wordt binnenkort geïmplementeerd.
            </p>
          </div>
          
          <Link
            href="/"
            className="block text-center btn-primary w-full"
          >
            ← Terug naar Home
          </Link>
          
          <div className="mt-8 text-center">
            <p className="text-slate-600 mb-3">Nog geen lid?</p>
            <Link
              href="/contact"
              className="text-emerald-600 hover:text-emerald-700 font-semibold text-lg"
            >
              Neem contact op →
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
