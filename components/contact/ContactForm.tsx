'use client'

import { useState } from 'react'

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Fout bij verzenden')
      }

      setStatus('success')
      setFormData({ name: '', email: '', message: '' })
    } catch (error) {
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Fout bij verzenden')
    }
  }

  if (status === 'success') {
    return (
      <div className="card p-8">
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-4 text-emerald-600">
            Bericht verzonden!
          </h2>
          <p className="text-xl text-slate-700 mb-8 leading-relaxed">
            Bedankt voor je bericht. We nemen zo snel mogelijk contact met je op.
          </p>
          <button
            onClick={() => setStatus('idle')}
            className="btn-primary"
          >
            Nog een bericht sturen
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-8">
      <h2 className="text-3xl font-bold mb-8 text-slate-900">Stuur ons een bericht</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-xl font-semibold mb-2 text-slate-900">
            Naam *
          </label>
          <input
            id="name"
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 text-lg border-2 border-slate-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-colors"
            disabled={status === 'loading'}
            placeholder="Je naam"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-xl font-semibold mb-2 text-slate-900">
            Email *
          </label>
          <input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 text-lg border-2 border-slate-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-colors"
            disabled={status === 'loading'}
            placeholder="je.email@voorbeeld.be"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-xl font-semibold mb-2 text-slate-900">
            Bericht *
          </label>
          <textarea
            id="message"
            required
            rows={6}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full px-4 py-3 text-lg border-2 border-slate-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none resize-y transition-colors"
            disabled={status === 'loading'}
            placeholder="Je bericht..."
          />
        </div>

        {status === 'error' && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-lg">{errorMessage}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full btn-primary disabled:bg-slate-400 disabled:cursor-not-allowed"
        >
          {status === 'loading' ? 'Verzenden...' : 'Verstuur bericht'}
        </button>
      </form>
    </div>
  )
}
