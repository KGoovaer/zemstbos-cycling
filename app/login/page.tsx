import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { LoginForm } from '@/components/auth/LoginForm'
import { GoogleButton } from '@/components/auth/GoogleButton'

export const metadata = {
  title: 'Aanmelden - Zemst BOS Cycling Club',
  description: 'Meld je aan bij Zemst BOS Cycling Club',
}

export default async function LoginPage() {
  const session = await auth()

  // If already logged in, redirect to homepage
  if (session) {
    redirect('/')
  }
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

          <div className="space-y-6">
            {/* Google Sign-In Button (only shown if enabled) */}
            <GoogleButton />

            {/* Divider - only show if Google is enabled */}
            {process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED && (
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-slate-200" />
                </div>
                <div className="relative flex justify-center text-base">
                  <span className="px-4 bg-white text-slate-500 font-medium">
                    Of met e-mail
                  </span>
                </div>
              </div>
            )}

            {/* Email/Password Form */}
            <LoginForm />
          </div>

          <div className="mt-8 text-center space-y-4">
            <Link
              href="/"
              className="block text-slate-600 hover:text-slate-800 font-medium text-lg"
            >
              ← Terug naar Home
            </Link>

            <div>
              <p className="text-slate-600 mb-2">Nog geen lid?</p>
              <Link
                href="/contact"
                className="text-emerald-600 hover:text-emerald-700 font-semibold text-lg"
              >
                Neem contact op →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
