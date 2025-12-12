import { redirect } from 'next/navigation'
import { auth } from '@/auth'

export const metadata = {
  title: 'Dashboard - Zemst BOS Cycling Club',
  description: 'Member dashboard',
}

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="card p-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Welkom, {session.user.name}!
          </h1>
          <p className="text-xl text-slate-600 mb-6">
            Je bent succesvol aangemeld.
          </p>

          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Account Details</h2>
            <dl className="space-y-2">
              <div>
                <dt className="text-lg font-semibold text-slate-700">Email:</dt>
                <dd className="text-lg text-slate-600">{session.user.email}</dd>
              </div>
              <div>
                <dt className="text-lg font-semibold text-slate-700">Rol:</dt>
                <dd className="text-lg text-slate-600 capitalize">{session.user.role}</dd>
              </div>
              <div>
                <dt className="text-lg font-semibold text-slate-700">User ID:</dt>
                <dd className="text-lg text-slate-600 font-mono text-sm">{session.user.id}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
            <p className="text-lg text-slate-700">
              🚧 Het volledige dashboard wordt binnenkort geïmplementeerd.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
