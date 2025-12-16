'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { data: session, status } = useSession()

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">Z</span>
            </div>
            <span className="font-bold text-xl text-slate-900">Zemst BOS</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-lg text-slate-800 hover:text-emerald-600 transition-colors font-semibold"
            >
              Home
            </Link>

            {status === 'loading' ? (
              <div className="text-slate-600">Loading...</div>
            ) : session ? (
              <>
                <Link
                  href="/calendar"
                  className="text-lg text-slate-800 hover:text-emerald-600 transition-colors font-semibold"
                >
                  Kalender
                </Link>
                <Link
                  href="/events"
                  className="text-lg text-slate-800 hover:text-emerald-600 transition-colors font-semibold"
                >
                  Events
                </Link>
                {session.user.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="text-lg text-emerald-700 hover:text-emerald-600 transition-colors font-bold"
                  >
                    Admin
                  </Link>
                )}
                <div className="flex items-center space-x-4">
                  <span className="text-slate-800 font-semibold">
                    {session.user.name}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="bg-slate-700 text-white px-6 py-2 rounded-lg hover:bg-slate-800 transition-colors font-semibold shadow-md hover:shadow-lg"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition-colors font-semibold shadow-md hover:shadow-lg"
              >
                Login
              </Link>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-700"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4">
            <Link
              href="/"
              className="block text-lg text-slate-800 hover:text-emerald-600 transition-colors font-semibold py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>

            {status === 'loading' ? (
              <div className="text-slate-600 py-2">Loading...</div>
            ) : session ? (
              <>
                <Link
                  href="/calendar"
                  className="block text-lg text-slate-800 hover:text-emerald-600 transition-colors font-semibold py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Kalender
                </Link>
                <Link
                  href="/events"
                  className="block text-lg text-slate-800 hover:text-emerald-600 transition-colors font-semibold py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Events
                </Link>
                {session.user.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="block text-lg text-emerald-700 hover:text-emerald-600 transition-colors font-bold py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                <div className="py-2">
                  <span className="block text-slate-800 font-semibold mb-2">
                    {session.user.name}
                  </span>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      handleSignOut()
                    }}
                    className="block w-full bg-slate-700 text-white px-6 py-3 rounded-lg hover:bg-slate-800 transition-colors font-semibold text-center shadow-md"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <Link
                href="/login"
                className="block bg-emerald-500 text-white px-6 py-3 rounded-lg hover:bg-emerald-600 transition-colors font-semibold text-center shadow-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}
